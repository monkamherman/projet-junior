import { useState } from 'react';
import { 
  Container, 
  Title, 
  Paper, 
  TextInput, 
  Button, 
  Group, 
  Avatar, 
  Text, 
  Tabs,
  LoadingOverlay,
  Alert,
  FileButton,
  PasswordInput,
  Stack,
  Badge
} from '@mantine/core';
import { createStyles } from '@mantine/emotion';
import { 
  IconUser, 
  IconLock, 
  IconDeviceFloppy, 
  IconCheck,
  IconUpload,
  IconX,
  IconUserCircle
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useProfile, useUpdateProfile, useUpdatePassword, useUploadAvatar } from '../hooks/useProfile';
import { notifications } from '@mantine/notifications';

const useStyles = createStyles((theme) => ({
  profileHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    border: '4px solid',
    borderColor: theme.variant({ variant: 'filled', color: theme.primaryColor, colorScheme: 'light' }).background,
    boxShadow: theme.shadows.md,
  },
  changeAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors[theme.primaryColor][6],
    color: theme.white,
    '&:hover': {
      backgroundColor: theme.colors[theme.primaryColor][7],
    },
  },
  tabContent: {
    padding: theme.spacing.md,
  },
}));

export function ProfilePage() {
  const { classes } = useStyles();
  const [activeTab, setActiveTab] = useState<string | null>('profile');
  const { data: profile, isLoading, error: profileError } = useProfile({
    onError: () => {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger le profil',
        color: 'red',
      });
    }
  });
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const { mutate: uploadAvatar, isPending } = useUploadAvatar();
  
  const profileForm = useForm({
    initialValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Email invalide'),
    },
  });
  
  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value) => (value.length < 6 ? 'Le mot de passe doit contenir au moins 6 caractères' : null),
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Les mots de passe ne correspondent pas' : null,
    },
  });
  
  // Mettre à jour le formulaire quand le profil est chargé
  if (profile && !profileForm.isDirty()) {
    profileForm.setValues({
      nom: profile.nom,
      prenom: profile.prenom,
      email: profile.email,
      telephone: profile.telephone || '',
    });
  }
  
  const handleProfileSubmit = async (values: typeof profileForm.values) => {
    try {
      await updateProfile.mutateAsync(values);
      notifications.show({
        title: 'Succès',
        message: 'Profil mis à jour avec succès',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch {
      notifications.show({
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la mise à jour du profil',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };
  
  const handlePasswordSubmit = async (values: typeof passwordForm.values) => {
    try {
      await updatePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      passwordForm.reset();
      
      notifications.show({
        title: 'Succès',
        message: 'Mot de passe mis à jour avec succès',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch {
      notifications.show({
        title: 'Erreur',
        message: 'Le mot de passe actuel est incorrect',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };
  
  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: 'Erreur',
        message: 'La taille de l\'image ne doit pas dépasser 5 Mo',
        color: 'red',
      });
      return;
    }
    
    uploadAvatar(file, {
      onSuccess: () => {
        notifications.show({
          title: 'Succès',
          message: 'Photo de profil mise à jour avec succès',
          color: 'green',
        });
      },
      onError: () => {
        notifications.show({
          title: 'Erreur',
          message: 'Une erreur est survenue lors du téléchargement de la photo',
          color: 'red',
        });
      },
    });
  };
  
  
  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }
  
  if (!profile) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" title="Erreur">
          Impossible de charger le profil. Veuillez réessayer.
        </Alert>
      </Container>
    );
  }
  
  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    FORMATEUR: 'Formateur',
    APPRENANT: 'Apprenant',
  };
  
  const roleColors: Record<string, string> = {
    ADMIN: 'red',
    FORMATEUR: 'blue',
    APPRENANT: 'green',
  };

  return (
    <Container size="md" py="xl">
      <div className={classes.profileHeader}>
        <div className={classes.avatarWrapper}>
          <Avatar 
            src={profile.avatarUrl} 
            alt={`${profile.prenom} ${profile.nom}`}
            size={120}
            radius={60}
            className={classes.avatar}
          >
            <IconUserCircle size={60} />
          </Avatar>
          
          <FileButton onChange={handleAvatarChange} accept="image/png,image/jpeg">
            {(props) => (
              <Button
                {...props}
                className={classes.changeAvatarBtn}
                radius="xl"
                size="xs"
                loading={isPending}
              >
                <IconUpload size={16} />
              </Button>
            )}
          </FileButton>
        </div>
        
        <Title order={2}>
          {profile.prenom} {profile.nom}
        </Title>
        
        <Badge 
          size="lg" 
          color={roleColors[profile.role]}
          variant="light"
          mt="xs"
        >
          {roleLabels[profile.role]}
        </Badge>
        
        <Text color="dimmed" mt={4}>
          Membre depuis le {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </div>
      
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="profile" leftSection={<IconUser size={14} />}>
            Profil
          </Tabs.Tab>
          <Tabs.Tab value="password" leftSection={<IconLock size={14} />}>
            Sécurité
          </Tabs.Tab>
        </Tabs.List>
        
        <Paper withBorder p="md" mt="md">
          <Tabs.Panel value="profile" className={classes.tabContent}>
            <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    label="Prénom"
                    placeholder="Votre prénom"
                    required
                    {...profileForm.getInputProps('prenom')}
                  />
                  <TextInput
                    label="Nom"
                    placeholder="Votre nom"
                    required
                    {...profileForm.getInputProps('nom')}
                  />
                </Group>
                
                <TextInput
                  label="Email"
                  placeholder="votre@email.com"
                  required
                  type="email"
                  {...profileForm.getInputProps('email')}
                />
                
                <TextInput
                  label="Téléphone"
                  placeholder="+33 6 12 34 56 78"
                  {...profileForm.getInputProps('telephone')}
                />
                
                <Group justify="flex-end" mt="md">
                  <Button 
                    type="submit" 
                    leftSection={<IconDeviceFloppy size={16} />}
                    loading={updateProfile.isPending}
                  >
                    Enregistrer les modifications
                  </Button>
                </Group>
              </Stack>
            </form>
          </Tabs.Panel>
          
          <Tabs.Panel value="password" className={classes.tabContent}>
            <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
              <Stack gap="md">
                <PasswordInput
                  label="Mot de passe actuel"
                  placeholder="Votre mot de passe actuel"
                  required
                  {...passwordForm.getInputProps('currentPassword')}
                />
                
                <PasswordInput
                  label="Nouveau mot de passe"
                  placeholder="Votre nouveau mot de passe"
                  required
                  {...passwordForm.getInputProps('newPassword')}
                />
                
                <PasswordInput
                  label="Confirmer le nouveau mot de passe"
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                  {...passwordForm.getInputProps('confirmPassword')}
                />
                
                <Group justify="flex-end" mt="md">
                  <Button 
                    type="submit" 
                    leftSection={<IconLock size={16} />}
                    loading={updatePassword.isPending}
                  >
                    Changer le mot de passe
                  </Button>
                </Group>
              </Stack>
            </form>
          </Tabs.Panel>
        </Paper>
      </Tabs>
    </Container>
  );
}
