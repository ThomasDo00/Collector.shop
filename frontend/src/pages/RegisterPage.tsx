import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store';
import { register as registerUser, selectAuthLoading, selectAuthError, clearError } from '@/features/auth/authSlice';
import Typography from '@/components/atoms/Typography';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Alert from '@/components/molecules/Alert';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  username: z
    .string()
    .min(3, 'Le nom d\'utilisateur doit faire au moins 3 caracteres')
    .max(30, 'Le nom d\'utilisateur ne peut pas depasser 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Seuls les lettres, chiffres et underscores sont autorises'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caracteres')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^a-zA-Z0-9]/, 'Le mot de passe doit contenir au moins un caractere special'),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions d\'utilisation' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Registration page
 */
function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false as unknown as true, // Type hack for checkbox
    },
  });

  const password = watch('password', '');

  // Password strength indicators
  const passwordChecks = [
    { label: '8 caracteres minimum', valid: password.length >= 8 },
    { label: 'Une majuscule', valid: /[A-Z]/.test(password) },
    { label: 'Un chiffre', valid: /[0-9]/.test(password) },
    { label: 'Un caractere special', valid: /[^a-zA-Z0-9]/.test(password) },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    dispatch(clearError());

    const result = await dispatch(registerUser({
      email: data.email,
      username: data.username,
      password: data.password,
    }));

    if (registerUser.fulfilled.match(result)) {
      setRegistrationSuccess(true);
    }
  };

  // Success state
  if (registrationSuccess) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="success" size="xl" className="text-success-600" />
        </div>

        <Typography variant="h2" className="mb-2">
          Compte cree !
        </Typography>
        <Typography color="muted" className="mb-8">
          Un email de verification a ete envoye a votre adresse.
          Veuillez verifier votre boite de reception.
        </Typography>

        <Button
          variant="primary"
          onClick={() => navigate('/login')}
        >
          Aller a la connexion
        </Button>
      </div>
    );
  }

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

      {/* Error Alert */}
      {authError && (
        <Alert
          variant="error"
          message={authError.message}
          onClose={() => dispatch(clearError())}
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          {...register('email')}
          type="email"
          label="Adresse email"
          placeholder="votre@email.com"
          error={errors.email?.message}
          leftIcon={<Icon name="email" size="sm" />}
          autoComplete="email"
          required
        />

        <Input
          {...register('username')}
          type="text"
          label="Nom d'utilisateur"
          placeholder="mon_pseudo"
          error={errors.username?.message}
          leftIcon={<Icon name="user" size="sm" />}
          autoComplete="username"
          helpText="3-30 caracteres, lettres, chiffres et underscore uniquement"
          required
        />

        <div>
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Mot de passe"
            placeholder="••••••••"
            error={errors.password?.message}
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

          {/* Password strength */}
          {password && (
            <div className="mt-2 space-y-1">
              {passwordChecks.map((check) => (
                <div
                  key={check.label}
                  className={`flex items-center gap-2 text-sm ${
                    check.valid ? 'text-success-600' : 'text-gray-400'
                  }`}
                >
                  <Icon
                    name={check.valid ? 'check' : 'close'}
                    size="xs"
                  />
                  <span>{check.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Input
          {...register('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirmer le mot de passe"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
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
            {...register('acceptTerms')}
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
        {errors.acceptTerms && (
          <p className="text-sm text-error-500 mt-1">{errors.acceptTerms.message}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          className="mt-6"
        >
          Creer mon compte
        </Button>
      </form>

      {/* Login Link */}
      <p className="mt-8 text-center text-sm text-gray-600">
        Deja un compte ?{' '}
        <Link
          to="/login"
          className="font-medium text-primary-800 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
