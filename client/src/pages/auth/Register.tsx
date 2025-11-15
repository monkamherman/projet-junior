// src/pages/auth/Register.tsx
import { authApi } from '@/api';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as z from 'zod';

const createSchema = (otpSent: boolean) => {
  return z
    .object({
      nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
      prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
      email: z.string().email('Email invalide'),
      telephone: z.string().min(10, 'Numéro de téléphone invalide'),
      motDePasse: z
        .string()
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
      confirmPassword: z.string(),
      otp: otpSent 
        ? z.string().min(6, 'Le code OTP est requis')
        : z.string().optional(),
    })
    .refine((data) => data.motDePasse === data.confirmPassword, {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmPassword'],
    });
};

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(otpSent)),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      motDePasse: '',
      confirmPassword: '',
      otp: '',
    },
  });

  const onSubmit = async (values: z.infer<ReturnType<typeof createSchema>>) => {
    setIsSubmitting(true);
    try {
      if (!otpSent) {
        // Première étape : Envoi des informations et demande d'OTP
        await authApi.register({
          nom: values.nom,
          prenom: values.prenom,
          email: values.email,
          telephone: values.telephone,
          motDePasse: values.motDePasse,
        });

        setOtpSent(true);
        toast({
          title: 'Code OTP envoyé',
          description: 'Veuillez vérifier votre email et entrer le code OTP',
        });
      } else {
        // Deuxième étape : Vérification de l'OTP et création du compte
        const response = await authApi.verifyOtp({
          email: values.email,
          otp: values.otp || '',
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone,
          motDePasse: values.motDePasse,
        });

        if (response.data.success) {
          toast({
            title: 'Compte créé avec succès !',
            description: 'Votre compte a été créé avec succès.',
            variant: 'default',
          });
          // Redirection vers la page de connexion après un court délai
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          throw new Error(response.data.message || "Échec de la création du compte");
        }
      }
    } catch (err: unknown) {
      let errorMessage = 'Une erreur est survenue';
      
      if (err && typeof err === 'object') {
        const error = err as {
          response?: {
            data?: {
              message?: string;
              code?: string;
            };
          };
          message?: string;
        };
        
        errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';
        
        // Si l'erreur concerne l'OTP, on réinitialise le formulaire
        if (error.response?.data?.code === 'INVALID_OTP') {
          setOtpSent(false);
        }
      }
      
      console.error('Erreur lors de l\'inscription:', err);
      
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-muted-foreground">
            {otpSent
              ? 'Entrez le code OTP reçu par email'
              : 'Entrez vos informations pour créer un compte'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div
              className={`space-y-4 ${otpSent ? 'opacity-50' : ''}`}
              style={{ filter: otpSent ? 'blur(2px)' : 'none' }}
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prenom"
                  disabled={otpSent || isSubmitting}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nom"
                  disabled={otpSent || isSubmitting}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                disabled={otpSent || isSubmitting}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="votre@email.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone"
                disabled={otpSent || isSubmitting}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Votre numéro de téléphone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motDePasse"
                disabled={otpSent || isSubmitting}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                disabled={otpSent || isSubmitting}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {otpSent && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code OTP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Entrez le code reçu par email"
                          {...field}
                          className="text-center text-xl tracking-widest"
                          maxLength={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setOtpSent(false)}
                >
                  Modifier les informations
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? 'Traitement en cours...'
                : otpSent
                  ? 'Vérifier le code OTP'
                  : "S'inscrire"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          Déjà un compte ?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
