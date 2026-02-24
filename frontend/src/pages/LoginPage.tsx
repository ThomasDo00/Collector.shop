import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  login,
  verifyMfaLogin,
  cancelMfa,
  selectAuthLoading,
  selectAuthError,
  selectMfaRequired,
  clearError,
} from '@/features/auth/authSlice';
import Typography from '@/components/atoms/Typography';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Alert from '@/components/molecules/Alert';

// Validation schemas
const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email ou nom d\'utilisateur requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const mfaSchema = z.object({
  totpCode: z
    .string()
    .length(6, 'Le code doit contenir 6 chiffres')
    .regex(/^\d+$/, 'Le code ne doit contenir que des chiffres'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type MfaFormData = z.infer<typeof mfaSchema>;

/**
 * Login page — handles both the password step and the MFA step.
 */
function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const mfaRequired = useAppSelector(selectMfaRequired);

  // Get redirect path from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const mfaSetupDone = (location.state as { mfaSetupDone?: boolean })?.mfaSetupDone ?? false;

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mfaForm = useForm<MfaFormData>({
    resolver: zodResolver(mfaSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    dispatch(clearError());
    const result = await dispatch(login(data));
    // Navigate only when MFA is not required (direct login success)
    if (login.fulfilled.match(result) && !result.payload.mfaRequired) {
      navigate(from, { replace: true });
    }
  };

  const onMfaSubmit = async (data: MfaFormData) => {
    dispatch(clearError());
    const result = await dispatch(verifyMfaLogin({ totpCode: data.totpCode }));
    if (verifyMfaLogin.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  const handleCancelMfa = () => {
    dispatch(cancelMfa());
    mfaForm.reset();
  };

  // ── Step 2: MFA verification ──────────────────────────────────────────────
  if (mfaRequired) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="shield" size="lg" className="text-primary-800" />
          </div>
          <Typography variant="h2" className="mb-2">
            Verification en 2 etapes
          </Typography>
          <Typography color="muted">
            Entrez le code a 6 chiffres affiche dans votre application d'authentification
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

        <form onSubmit={mfaForm.handleSubmit(onMfaSubmit)} className="space-y-5">
          <Input
            {...mfaForm.register('totpCode')}
            type="text"
            inputMode="numeric"
            label="Code d'authentification"
            placeholder="000000"
            error={mfaForm.formState.errors.totpCode?.message}
            leftIcon={<Icon name="shield" size="sm" />}
            autoComplete="one-time-code"
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            className="mt-2"
          >
            Verifier le code
          </Button>

          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={handleCancelMfa}
            disabled={isLoading}
          >
            Retour a la connexion
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Ouvrez Google Authenticator, Authy ou une autre application compatible TOTP pour obtenir votre code.
        </p>
      </div>
    );
  }

  // ── Step 1: Email + password ──────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <Typography variant="h2" className="mb-2">
          Bon retour !
        </Typography>
        <Typography color="muted">
          Connectez-vous a votre compte Collector.shop
        </Typography>
      </div>

      {/* MFA setup done banner */}
      {mfaSetupDone && (
        <Alert
          variant="success"
          message="Compte cree et 2FA active ! Connectez-vous maintenant avec votre code d'authentification."
          className="mb-6"
        />
      )}

      {/* Error Alert */}
      {authError && (
        <Alert
          variant="error"
          message={authError.message}
          onClose={() => dispatch(clearError())}
          className="mb-6"
        />
      )}

      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
        <Input
          {...loginForm.register('emailOrUsername')}
          type="text"
          label="Email ou nom d'utilisateur"
          placeholder="votre@email.com"
          error={loginForm.formState.errors.emailOrUsername?.message}
          leftIcon={<Icon name="email" size="sm" />}
          autoComplete="username"
        />

        <div className="relative">
          <Input
            {...loginForm.register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Mot de passe"
            placeholder="••••••••"
            error={loginForm.formState.errors.password?.message}
            leftIcon={<Icon name="shield" size="sm" />}
            autoComplete="current-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <Icon name={showPassword ? 'eye-slash' : 'eye'} size="sm" />
              </button>
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-800 border-gray-300 rounded focus:ring-primary-800"
            />
            <span className="text-sm text-gray-600">Se souvenir de moi</span>
          </label>

          <Link
            to="/forgot-password"
            className="text-sm text-primary-800 hover:underline"
          >
            Mot de passe oublie ?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          className="mt-6"
        >
          Se connecter
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">ou</span>
        </div>
      </div>

      {/* Social Login (placeholder) */}
      <Button
        variant="outline"
        fullWidth
        leftIcon={
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        }
        disabled
      >
        Continuer avec Google (bientot)
      </Button>

      {/* Register Link */}
      <p className="mt-8 text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link
          to="/register"
          className="font-medium text-primary-800 hover:underline"
        >
          Creer un compte
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
