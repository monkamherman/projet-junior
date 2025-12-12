// src/pages/auth/Login.tsx
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
import SEO from '@/components/ui/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      console.log('Tentative de connexion avec :', values);
      await login(values.email, values.password);

      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes maintenant connecté',
      });

      // Rediriger vers la page d'accueil après connexion réussie
      navigate('/');
    } catch (error) {
      console.error('Erreur de connexion :', error);

      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description:
          error instanceof Error
            ? error.message
            : 'Une erreur est survenue lors de la connexion',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-black">
      <SEO
        title="Connexion - Votre Compte"
        description="Connectez-vous à votre compte pour accéder à votre espace personnel"
      />

      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="text-muted-foreground">
            Entrez vos identifiants pour accéder à votre compte
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Mot de passe</FormLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
