import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import Typography from '@/components/atoms/Typography';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Alert from '@/components/molecules/Alert';

const totpSchema = z.object({
  totpCode: z
    .string()
    .length(6, 'Le code doit contenir 6 chiffres')
    .regex(/^\d+$/, 'Chiffres uniquement'),
});

type TotpFormData = z.infer<typeof totpSchema>;

type MfaStep = 'idle' | 'setup' | 'enable' | 'disable';

interface MfaSetupData {
  secret: string;
  qrCode: string;
}

/**
 * Settings page — currently exposes MFA (2FA) management.
 */
function SettingsPage() {
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null); // null = unknown
  const [step, setStep] = useState<MfaStep>('idle');
  const [setupData, setSetupData] = useState<MfaSetupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TotpFormData>({
    resolver: zodResolver(totpSchema),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSetup = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const data = await authService.setupMfa();
      setSetupData({ secret: data.secret, qrCode: data.qrCode });
      setStep('enable');
    } catch {
      setError('Impossible de generer le QR code. Veuillez reessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = async (data: TotpFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      await authService.enableMfa(data.totpCode);
      setMfaEnabled(true);
      setStep('idle');
      setSetupData(null);
      reset();
      setSuccess('L\'authentification a deux facteurs a ete activee avec succes.');
    } catch {
      setError('Code invalide. Verifiez votre application et reessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async (data: TotpFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      await authService.disableMfa(data.totpCode);
      setMfaEnabled(false);
      setStep('idle');
      reset();
      setSuccess('L\'authentification a deux facteurs a ete desactivee.');
    } catch {
      setError('Code invalide. Verifiez votre application et reessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStep('idle');
    setSetupData(null);
    setError(null);
    reset();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Typography variant="h1" className="mb-2">Parametres</Typography>
      <Typography color="muted" className="mb-10">
        Gerez la securite de votre compte.
      </Typography>

      {/* ── MFA Section ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="shield" size="sm" className="text-primary-800" />
          </div>
          <div>
            <Typography variant="h3" className="mb-1">
              Authentification a deux facteurs (2FA)
            </Typography>
            <Typography color="muted" className="text-sm">
              Ajoutez une couche de securite supplementaire en demandant un code
              genere par votre application d'authentification lors de chaque connexion.
            </Typography>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="error" message={error} onClose={() => setError(null)} className="mb-4" />
        )}
        {success && (
          <Alert variant="success" message={success} onClose={() => setSuccess(null)} className="mb-4" />
        )}

        {/* ── Idle: show current status + action button ── */}
        {step === 'idle' && (
          <div>
            {mfaEnabled === null && (
              <Typography color="muted" className="text-sm mb-4">
                Statut actuel inconnu. Consultez vos parametres de compte pour verifier.
              </Typography>
            )}
            {mfaEnabled === true && (
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Active
                </span>
                <Typography color="muted" className="text-sm">
                  Votre compte est protege par une application d'authentification.
                </Typography>
              </div>
            )}
            {mfaEnabled === false && (
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  Desactive
                </span>
                <Typography color="muted" className="text-sm">
                  Activez le 2FA pour mieux proteger votre compte.
                </Typography>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              {mfaEnabled !== true && (
                <Button
                  variant="primary"
                  onClick={handleSetup}
                  isLoading={isLoading}
                  leftIcon={<Icon name="shield" size="sm" />}
                >
                  Activer le 2FA
                </Button>
              )}
              {mfaEnabled === true && (
                <Button
                  variant="outline"
                  onClick={() => { setStep('disable'); setError(null); reset(); }}
                >
                  Desactiver le 2FA
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Enable step: scan QR then enter code ── */}
        {step === 'enable' && setupData && (
          <div className="space-y-6">
            <div>
              <Typography variant="h4" className="mb-2">
                Etape 1 — Scannez le QR code
              </Typography>
              <Typography color="muted" className="text-sm mb-4">
                Ouvrez Google Authenticator, Authy ou une application compatible TOTP
                et scannez ce QR code.
              </Typography>
              <div className="flex justify-center">
                <img
                  src={setupData.qrCode}
                  alt="QR code pour configurer le 2FA"
                  className="w-48 h-48 border border-gray-200 rounded-xl p-2"
                />
              </div>
            </div>

            <div>
              <Typography variant="h4" className="mb-1">
                Cle secrete (saisie manuelle)
              </Typography>
              <Typography color="muted" className="text-xs mb-2">
                Si vous ne pouvez pas scanner le QR code, entrez cette cle manuellement.
              </Typography>
              <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-sm tracking-widest text-center break-all select-all border border-gray-200">
                {setupData.secret}
              </div>
            </div>

            <div>
              <Typography variant="h4" className="mb-2">
                Etape 2 — Confirmez avec un code
              </Typography>
              <Typography color="muted" className="text-sm mb-4">
                Entrez le code a 6 chiffres affiche dans votre application pour
                confirmer la configuration.
              </Typography>
              <form onSubmit={handleSubmit(handleEnable)} className="space-y-4">
                <Input
                  {...register('totpCode')}
                  type="text"
                  inputMode="numeric"
                  label="Code de verification"
                  placeholder="000000"
                  error={errors.totpCode?.message}
                  leftIcon={<Icon name="shield" size="sm" />}
                  autoComplete="one-time-code"
                  maxLength={6}
                />
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" isLoading={isLoading}>
                    Confirmer l'activation
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading}>
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Disable step: enter code to confirm ── */}
        {step === 'disable' && (
          <div className="space-y-4">
            <Typography color="muted" className="text-sm">
              Pour desactiver le 2FA, entrez le code actuel de votre application
              d'authentification.
            </Typography>
            <form onSubmit={handleSubmit(handleDisable)} className="space-y-4">
              <Input
                {...register('totpCode')}
                type="text"
                inputMode="numeric"
                label="Code de verification"
                placeholder="000000"
                error={errors.totpCode?.message}
                leftIcon={<Icon name="shield" size="sm" />}
                autoComplete="one-time-code"
                maxLength={6}
              />
              <div className="flex gap-3">
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  Confirmer la desactivation
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading}>
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}

export default SettingsPage;
