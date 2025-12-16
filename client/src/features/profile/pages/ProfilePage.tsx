import type { Attestation } from '@/features/attestations/api/attestations.api';
import { useMesAttestations } from '@/features/attestations/api/attestations.api';
import {
  useGenerateAttestationMutation,
  useUserFormations,
} from '@/features/formations/hooks/useFormations';
import { useUserPayments } from '@/features/payments/hooks/usePayments';
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
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
  IconUser,
  IconX,
  IconX as IconXCircle,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import React, { useState } from 'react';
import {
  useProfile,
  useUpdatePassword,
  useUpdateProfile,
} from '../hooks/useProfile';
import type { UserProfile } from '../types';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string | null>('profile');

  // Charger les données des formations et des paiements
  const { data: formations = [], isLoading: isLoadingFormations } =
    useUserFormations() as {
      data: Array<{
        id: string;
        titre: string;
        dateDebut: string;
        dateFin: string;
        statut: string;
        formateur: { prenom: string; nom: string };
      }>;
      isLoading: boolean;
    };
  const { data: payments = [], isLoading: isLoadingPayments } =
    useUserPayments();
  const { data: attestations = [], isLoading: isLoadingAttestations } =
    useMesAttestations();
  const { mutate: generateAttestation, isPending: isGeneratingAttestation } =
    useGenerateAttestationMutation();

  const { data: profile, isLoading } = useProfile() as {
    data: UserProfile | null;
    isLoading: boolean;
  };

  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();

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
        style={
          statusInfo.color.includes('status')
            ? {
                backgroundColor:
                  statusInfo.color === 'statusPaid'
                    ? 'var(--mantine-color-green-0)'
                    : statusInfo.color === 'statusPending'
                      ? 'var(--mantine-color-orange-0)'
                      : 'var(--mantine-color-red-0)',
                color:
                  statusInfo.color === 'statusPaid'
                    ? 'var(--mantine-color-green-7)'
                    : statusInfo.color === 'statusPending'
                      ? 'var(--mantine-color-orange-7)'
                      : 'var(--mantine-color-red-7)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--mantine-spacing-xs)',
                padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)',
                borderRadius: 'var(--mantine-radius-sm)',
                fontWeight: 500,
              }
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: 'var(--mantine-spacing-xl)',
        }}
      >
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
          <Tabs.Tab
            value="attestations"
            leftSection={<IconFileDownload size={14} />}
          >
            Mes Attestations
          </Tabs.Tab>
          <Tabs.Tab value="payments" leftSection={<IconReceipt2 size={14} />}>
            Mes Paiements
          </Tabs.Tab>
          <Tabs.Tab value="password" leftSection={<IconLock size={14} />}>
            Sécurité
          </Tabs.Tab>
        </Tabs.List>

        <Paper withBorder p="md" mt="md">
          <Tabs.Panel value="profile" p="md">
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

          <Tabs.Panel value="formations" p="md">
            <Stack gap="md">
              <Title order={3} mb="md">
                Mes Formations Payées
              </Title>

              {isLoadingFormations ? (
                <LoadingOverlay visible={true} />
              ) : formations?.length === 0 ? (
                <Alert color="blue">
                  Vous n'avez aucune formation payée pour le moment. Les
                  formations apparaissent ici après validation de votre
                  paiement.
                </Alert>
              ) : (
                <Stack gap="md">
                  {formations?.map((formation) => (
                    <Card
                      key={formation.id}
                      withBorder
                      radius="md"
                      style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow =
                          'var(--mantine-shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Group justify="space-between" align="flex-start">
                        <div>
                          <Group gap="sm" mb="sm">
                            <Text fw={600} size="lg">
                              {formation.titre}
                            </Text>
                            <Badge color="green" variant="light" size="sm">
                              Payée
                            </Badge>
                          </Group>
                          <Text c="dimmed" size="sm" mt={4} component="div">
                            <Group gap={4}>
                              <IconCalendar size={14} />
                              {formatDate(formation.dateDebut)} -{' '}
                              {formatDate(formation.dateFin)}
                            </Group>
                          </Text>
                          <Text c="dimmed" size="sm" mt={4} component="div">
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
                            loading={isGeneratingAttestation}
                            onClick={async () => {
                              try {
                                await generateAttestation(formation.id);
                                notifications.show({
                                  title: 'Succès',
                                  message:
                                    'Attestation téléchargée avec succès',
                                  color: 'green',
                                });
                              } catch {
                                notifications.show({
                                  title: 'Erreur',
                                  message:
                                    "Erreur lors du téléchargement de l'attestation",
                                  color: 'red',
                                });
                              }
                            }}
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

          <Tabs.Panel value="attestations" p="md">
            <Stack gap="md">
              <Title order={3} mb="md">
                Mes Attestations
              </Title>

              {isLoadingAttestations ? (
                <LoadingOverlay visible={true} />
              ) : attestations?.length === 0 ? (
                <Alert color="blue">
                  Vous n'avez aucune attestation pour le moment. Les
                  attestations sont générées automatiquement après la validation
                  de votre formation.
                </Alert>
              ) : (
                <Stack gap="md">
                  {attestations?.map((attestation: Attestation) => (
                    <Card
                      key={attestation.id}
                      withBorder
                      radius="md"
                      style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow =
                          'var(--mantine-shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Group justify="space-between" align="flex-start">
                        <div>
                          <Text fw={600} size="lg">
                            {attestation.inscription.formation.titre}
                          </Text>
                          <Text c="dimmed" size="sm" mt={4} component="div">
                            <Group gap={4}>
                              <IconCalendar size={14} />
                              {formatDate(
                                attestation.inscription.formation.dateDebut
                              )}{' '}
                              -{' '}
                              {formatDate(
                                attestation.inscription.formation.dateFin
                              )}
                            </Group>
                          </Text>
                          <Text c="dimmed" size="sm" mt={4}>
                            Numéro: {attestation.numero}
                          </Text>
                          <Badge
                            color={
                              attestation.statut === 'TELECHARGEE'
                                ? 'green'
                                : attestation.statut === 'ENVOYEE'
                                  ? 'blue'
                                  : 'orange'
                            }
                            variant="light"
                            mt="md"
                          >
                            {attestation.statut === 'TELECHARGEE'
                              ? 'Téléchargée'
                              : attestation.statut === 'ENVOYEE'
                                ? 'Envoyée'
                                : 'Générée'}
                          </Badge>
                        </div>

                        <Button
                          leftSection={<IconFileDownload size={16} />}
                          variant="outline"
                          onClick={() => {
                            // Implémenter le téléchargement de l'attestation
                            window.open(attestation.urlPdf, '_blank');
                          }}
                        >
                          Télécharger
                        </Button>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="payments" p="md">
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
                        <Table.Td>{payment.formation?.titre || 'N/A'}</Table.Td>
                        <Table.Td>{formatDate(payment.datePaiement)}</Table.Td>
                        <Table.Td>{formatCurrency(payment.montant)}</Table.Td>
                        <Table.Td>
                          <Badge variant="outline">
                            {payment.methode === 'CARTE'
                              ? 'Carte'
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

          <Tabs.Panel value="password" p="md">
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
