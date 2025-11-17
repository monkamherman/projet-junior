import {
  useGenerateAttestation,
  useUserFormations,
} from '@/features/formations/hooks/useFormations';
import { useUserPayments } from '@/features/payments/hooks/usePayments';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  FileButton,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { createStyles } from '@mantine/emotion';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconCalendar,
  IconCheck,
  IconCheck as IconCheckCircle,
  IconClockHour4,
  IconDeviceFloppy,
  IconFileDownload,
  IconLock,
  IconReceipt2,
  IconSchool,
  IconUpload,
  IconUser,
  IconUserCircle,
  IconX,
  IconX as IconXCircle,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import React, { useState } from 'react';
import type { UserProfile } from '../hooks/useProfile';
import { useProfile, useUpdatePassword, useUpdateProfile, useUploadAvatar } from '../hooks/useProfile';

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
    borderColor: theme.colors.blue[6],
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
  formationCard: {
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.md,
    },
  },
  paymentStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,
  },
  statusPaid: {
    backgroundColor: theme.colors.green[0],
    color: theme.colors.green[7],
  },
  statusPending: {
    backgroundColor: theme.colors.orange[0],
    color: theme.colors.orange[7],
  },
  statusError: {
    backgroundColor: theme.colors.red[0],
    color: theme.colors.red[7],
  },
}));

export function ProfilePage() {
  const { classes } = useStyles();
  const [activeTab, setActiveTab] = useState<string | null>('profile');

  // Charger les données des formations et des paiements
  const { data: formations = [], isLoading: isLoadingFormations } = useUserFormations() as { data: Array<{ id: string; titre: string; dateDebut: string; dateFin: string; statut: string; formateur: { prenom: string; nom: string } }>; isLoading: boolean };
  const { data: payments = [], isLoading: isLoadingPayments } = useUserPayments() as { data: Array<{ id: string; montant: number; methode: string; statut: string; date: string }>; isLoading: boolean };
  const { mutate: generateAttestation, isPending: isGeneratingAttestation } = useGenerateAttestation() as {
    mutate: (id: string) => Promise<Blob>;
    isPending: boolean;
  };

  const { data: profile, isLoading } = useProfile() as { data: UserProfile | null; isLoading: boolean };

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
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : 'Email invalide',
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value) =>
        value.length < 6
          ? 'Le mot de passe doit contenir au moins 6 caractères'
          : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword
          ? 'Les mots de passe ne correspondent pas'
          : null,
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
        message: "La taille de l'image ne doit pas dépasser 5 Mo",
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      PAYE: {
        color: 'statusPaid',
        icon: <IconCheckCircle size={16} />,
        label: 'Payé',
      },
      EN_ATTENTE: {
        color: 'statusPending',
        icon: <IconClockHour4 size={16} />,
        label: 'En attente',
      },
      ERREUR: {
        color: 'statusError',
        icon: <IconXCircle size={16} />,
        label: 'Erreur',
      },
      ANNULE: {
        color: 'gray',
        icon: <IconXCircle size={16} />,
        label: 'Annulé',
      },
    };

    const statusInfo = statusMap[status] || {
      color: 'gray',
      icon: null,
      label: status,
    };

    return (
      <Badge
        leftSection={statusInfo.icon}
        color={
          statusInfo.color.includes('status') ? undefined : statusInfo.color
        }
        className={
          statusInfo.color.includes('status')
            ? classes[statusInfo.color as keyof typeof classes]
            : undefined
        }
        variant={statusInfo.color.includes('status') ? 'light' : 'outline'}
      >
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <Container size="md" py="xl">
      <div className={classes.profileHeader}>
        <div className={classes.avatarWrapper}>
          <Avatar size={120} radius={60} className={classes.avatar}>
            <IconUserCircle size={60} />
          </Avatar>

          <FileButton
            onChange={handleAvatarChange}
            accept="image/png,image/jpeg"
          >
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
          Membre depuis le{' '}
          {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
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
          <Tabs.Tab value="formations" leftSection={<IconSchool size={14} />}>
            Mes Formations
          </Tabs.Tab>
          <Tabs.Tab value="payments" leftSection={<IconReceipt2 size={14} />}>
            Mes Paiements
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

          <Tabs.Panel value="formations" className={classes.tabContent}>
            <Stack gap="md">
              <Title order={3} mb="md">
                Mes Formations
              </Title>

              {isLoadingFormations ? (
                <LoadingOverlay visible={true} />
              ) : formations?.length === 0 ? (
                <Alert color="blue">
                  Vous n'êtes inscrit à aucune formation pour le moment.
                </Alert>
              ) : (
                <Stack gap="md">
                  {formations?.map((formation) => (
                    <Card
                      key={formation.id}
                      withBorder
                      radius="md"
                      className={classes.formationCard}
                    >
                      <Group justify="space-between" align="flex-start">
                        <div>
                          <Text fw={600} size="lg">
                            {formation.titre}
                          </Text>
                          <Text c="dimmed" size="sm" mt={4}>
                            <Group gap={4}>
                              <IconCalendar size={14} />
                              {formatDate(formation.dateDebut)} -{' '}
                              {formatDate(formation.dateFin)}
                            </Group>
                          </Text>
                          <Text c="dimmed" size="sm" mt={4}>
                            <Group gap={4}>
                              <IconUser size={14} />
                              Formateur: {formation.formateur.prenom}{' '}
                              {formation.formateur.nom}
                            </Group>
                          </Text>
                          <Badge
                            color={
                              formation.statut === 'TERMINE'
                                ? 'green'
                                : formation.statut === 'EN_COURS'
                                  ? 'blue'
                                  : 'gray'
                            }
                            variant="light"
                            mt="md"
                          >
                            {formation.statut === 'TERMINE'
                              ? 'Terminé'
                              : formation.statut === 'EN_COURS'
                                ? 'En cours'
                                : 'À venir'}
                          </Badge>
                        </div>

                        {formation.statut === 'TERMINE' && (
                          <Button
                            leftSection={<IconFileDownload size={16} />}
                            variant="outline"
                            onClick={async () => {
                              try {
                                const response = await generateAttestation(formation.id);
                                if (response) {
                                  const url = window.URL.createObjectURL(new Blob([response]));
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.setAttribute('download', `attestation-${formation.id}.pdf`);
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                }
                              } catch {
                                notifications.show({
                                  title: 'Erreur',
                                  message: "Impossible de générer l'attestation",
                                  color: 'red',
                                });
                              }
                            }}
                            loading={isGeneratingAttestation}
                          >
                            Télécharger l'attestation
                          </Button>
                        )}
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="payments" className={classes.tabContent}>
            <Stack gap="md">
              <Title order={3} mb="md">
                Historique des Paiements
              </Title>

              {isLoadingPayments ? (
                <LoadingOverlay visible={true} />
              ) : payments?.length === 0 ? (
                <Alert color="blue">Aucun paiement trouvé.</Alert>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Formation</Table.Th>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Montant</Table.Th>
                      <Table.Th>Méthode</Table.Th>
                      <Table.Th>Statut</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {payments?.map((payment) => (
                      <Table.Tr key={payment.id}>
                        <Table.Td>{payment.formation.titre}</Table.Td>
                        <Table.Td>{formatDate(payment.datePaiement)}</Table.Td>
                        <Table.Td>{formatCurrency(payment.montant)}</Table.Td>
                        <Table.Td>
                          <Badge variant="outline">
                            {payment.methode === 'CARTE'
                              ? 'Carte bancaire'
                              : payment.methode === 'VIREMENT'
                                ? 'Virement'
                                : payment.methode === 'ESPECES'
                                  ? 'Espèces'
                                  : 'Autre'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {getPaymentStatusBadge(payment.statut)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
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
