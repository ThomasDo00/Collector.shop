import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store';
import { register as registerUser, selectAuthLoading, selectAuthError, clearError } from '@/features/auth/authSlice';
import { authService } from '@/services/auth.service';
import Typography from '@/components/atoms/Typography';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Alert from '@/components/molecules/Alert';

// Validation schemas
const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Le nom d\'utilisateur doit faire au moins 3 caracteres')
    .max(30, 'Le nom d\'utilisateur ne peut pas depasser 30 caracteres')
    .regex(/^\w+$/, 'Seuls les lettres, chiffres et underscores sont autorises'),
  email: z.string().email('Adresse email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caracteres')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^a-zA-Z0-9]/, 'Le mot de passe doit contenir au moins un caractere special'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const totpSchema = z.object({
  totpCode: z
    .string()
    .length(6, 'Le code doit contenir 6 chiffres')
    .regex(/^\d+$/, 'Chiffres uniquement'),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type TotpFormData = z.infer<typeof totpSchema>;

type Step = 'form' | 'mfa-setup';

/**
 * Registration page with mandatory MFA setup.
 * Step 1: fill in account details.
 * Step 2: scan QR code and confirm with a TOTP code.
 */
function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [mfaData, setMfaData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false as unknown as true },
  });

  const totpForm = useForm<TotpFormData>({
    resolver: zodResolver(totpSchema),
  });

  const password = registerForm.watch('password', '');

  const passwordChecks = [
    { label: '8 caracteres minimum', valid: password.length >= 8 },
    { label: 'Une majuscule', valid: /[A-Z]/.test(password) },
    { label: 'Un chiffre', valid: /\d/.test(password) },
    { label: 'Un caractere special', valid: /[^a-zA-Z0-9]/.test(password) },
  ];

  // ── Step 1: create account then auto-login to fetch QR code ──────────────
  const onRegisterSubmit = async (data: RegisterFormData) => {
    dispatch(clearError());

    const result = await dispatch(registerUser({
      email: data.email,
      username: data.username,
      password: data.password,
    }));

    if (!registerUser.fulfilled.match(result)) return;

    // Auto-login in background (stores tokens, does NOT update Redux auth state)
    setMfaLoading(true);
    setMfaError(null);
    try {
      const loginResult = await authService.login({
        emailOrUsername: data.email,
        password: data.password,
      });

      // MFA can't already be required on a brand new account
      if (loginResult.mfaRequired) throw new Error('Unexpected MFA state');

      const setup = await authService.setupMfa();
      setMfaData({ secret: setup.secret, qrCode: setup.qrCode });
      setStep('mfa-setup');
    } catch {
      setMfaError('Impossible de configurer le 2FA. Votre compte a ete cree, connectez-vous pour activer le 2FA depuis les parametres.');
    } finally {
      setMfaLoading(false);
    }
  };

  // ── Step 2: confirm TOTP and enable MFA ──────────────────────────────────
  const onTotpSubmit = async (data: TotpFormData) => {
    setMfaError(null);
    setMfaLoading(true);
    try {
      await authService.enableMfa(data.totpCode);
      // Clean up the temporary session — user must now login with MFA
      authService.clearAuth();
      navigate('/login', { state: { mfaSetupDone: true } });
    } catch {
      setMfaError('Code invalide. Verifiez votre application et reessayez.');
    } finally {
      setMfaLoading(false);
    }
  };

  // ── Step 2 UI: QR code + TOTP confirmation ───────────────────────────────
  if (step === 'mfa-setup' && mfaData) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="shield" size="lg" className="text-primary-800" />
          </div>
          <Typography variant="h2" className="mb-2">
            Activez votre 2FA
          </Typography>
          <Typography color="muted">
            Votre compte est cree. Scannez le QR code pour securiser votre compte.
          </Typography>
        </div>

        {mfaError && (
          <Alert variant="error" message={mfaError} onClose={() => setMfaError(null)} className="mb-6" />
        )}

        {/* QR code */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <img
            src={mfaData.qrCode}
            alt="QR code 2FA"
            className="w-44 h-44 border border-gray-200 rounded-xl p-2"
          />
          <Typography color="muted" className="text-xs text-center">
            Utilisez Google Authenticator, Authy ou une appli compatible TOTP.
          </Typography>
        </div>

        {/* Manual secret */}
        <div className="mb-6">
          <Typography color="muted" className="text-xs mb-1 text-center">
            Saisie manuelle :
          </Typography>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-mono text-sm tracking-widest text-center break-all select-all">
            {mfaData.secret}
          </div>
        </div>

        {/* TOTP confirmation */}
        <form onSubmit={totpForm.handleSubmit(onTotpSubmit)} className="space-y-4">
          <Input
            {...totpForm.register('totpCode')}
            type="text"
            inputMode="numeric"
            label="Code de confirmation (6 chiffres)"
            placeholder="000000"
            error={totpForm.formState.errors.totpCode?.message}
            leftIcon={<Icon name="shield" size="sm" />}
            autoComplete="one-time-code"
            maxLength={6}
          />
          <Button type="submit" variant="primary" fullWidth isLoading={mfaLoading}>
            Confirmer et finaliser l'inscription
          </Button>
        </form>
      </div>
    );
  }

  // ── Step 1 UI: registration form ─────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <Typography variant="h2" className="mb-2">
          Creer un compte
        </Typography>
        <Typography color="muted">
          Rejoignez la communaute des collectionneurs
        </Typography>
      </div>

      {authError && (
        <Alert
          variant="error"
          message={authError.message}
          onClose={() => dispatch(clearError())}
          className="mb-6"
        />
      )}

      {mfaError && (
        <Alert variant="error" message={mfaError} onClose={() => setMfaError(null)} className="mb-6" />
      )}

      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
        <Input
          {...registerForm.register('username')}
          type="text"
          label="Nom d'utilisateur"
          placeholder="mon_pseudo"
          error={registerForm.formState.errors.username?.message}
          leftIcon={<Icon name="user" size="sm" />}
          autoComplete="username"
          helpText="3-30 caracteres, lettres, chiffres et underscore uniquement"
          required
        />

        <Input
          {...registerForm.register('email')}
          type="email"
          label="Adresse email"
          placeholder="votre@email.com"
          error={registerForm.formState.errors.email?.message}
          leftIcon={<Icon name="email" size="sm" />}
          autoComplete="email"
          required
        />

        <div>
          <Input
            {...registerForm.register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Mot de passe"
            placeholder="••••••••"
            error={registerForm.formState.errors.password?.message}
            leftIcon={<Icon name="shield" size="sm" />}
            autoComplete="new-password"
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                <Icon name="eye" size="sm" />
              </button>
            }
          />

          {password && (
            <div className="mt-2 space-y-1">
              {passwordChecks.map((check) => (
                <div
                  key={check.label}
                  className={`flex items-center gap-2 text-sm ${check.valid ? 'text-success-600' : 'text-gray-400'}`}
                >
                  <Icon name={check.valid ? 'check' : 'close'} size="xs" />
                  <span>{check.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Input
          {...registerForm.register('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirmer le mot de passe"
          placeholder="••••••••"
          error={registerForm.formState.errors.confirmPassword?.message}
          leftIcon={<Icon name="shield" size="sm" />}
          autoComplete="new-password"
          required
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
            >
              <Icon name="eye" size="sm" />
            </button>
          }
        />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...registerForm.register('acceptTerms')}
            className="mt-1 w-4 h-4 text-primary-800 border-gray-300 rounded focus:ring-primary-800"
          />
          <span className="text-sm text-gray-600">
            J'accepte les{' '}
            <Link to="/terms" className="text-primary-800 hover:underline">
              conditions d'utilisation
            </Link>
            {' '}et la{' '}
            <Link to="/privacy" className="text-primary-800 hover:underline">
              politique de confidentialite
            </Link>
          </span>
        </label>
        {registerForm.formState.errors.acceptTerms && (
          <p className="text-sm text-error-500 mt-1">{registerForm.formState.errors.acceptTerms.message}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading || mfaLoading}
          className="mt-6"
        >
          Creer mon compte
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Deja un compte ?{' '}
        <Link to="/login" className="font-medium text-primary-800 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
