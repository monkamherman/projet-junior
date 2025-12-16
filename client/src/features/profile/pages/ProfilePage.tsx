import { LoadingOverlay } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconCalendar,
  IconCheck,
  IconClockHour4,
  IconDeviceFloppy,
  IconFileDownload,
  IconLock,
  IconSchool,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import {
  useProfile,
  useUpdatePassword,
  useUpdateProfile,
} from '../hooks/useProfile';
import type { UserProfile } from '../types';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string | null>('profile');

  // Charger les données du profil
  const { data: profile, isLoading } = useProfile() as {
    data: UserProfile | null;
    isLoading: boolean;
  };

  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();

  // Utiliser directement les données de l'API
  const profileData = profile;

  // Fonction de téléchargement d'attestation
  const handleDownloadAttestation = (attestationId: string) => {
    console.log("Téléchargement de l'attestation:", attestationId);
    notifications.show({
      title: 'Téléchargement',
      message: 'Téléchargement du certificat en cours...',
      color: 'blue',
    });

    // Simulation de téléchargement
    setTimeout(() => {
      notifications.show({
        title: 'Succès',
        message: 'Certificat téléchargé avec succès',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    }, 1500);
  };

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
  if (profileData && !profileForm.isDirty()) {
    profileForm.setValues({
      nom: profileData.nom,
      prenom: profileData.prenom,
      email: profileData.email,
      telephone: profileData.telephone || '',
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
        message: 'Erreur lors de la mise à jour du profil',
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

  if (!profileData) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">
            Impossible de charger le profil. Veuillez réessayer.
          </p>
        </div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    FORMATEUR: 'Formateur',
    APPRENANT: 'Apprenant',
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Carte d'en-tête du profil */}
      <div className="mb-8 rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-6">
              {/* Avatar placeholder */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl font-semibold text-white shadow-lg">
                {profileData.prenom?.[0]?.toUpperCase() || ''}
                {profileData.nom?.[0]?.toUpperCase() || ''}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="mb-2 break-words text-2xl font-bold">
                  {profileData.prenom} {profileData.nom}
                </h2>

                <div className="mb-4 flex flex-wrap gap-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      profileData.role === 'ADMIN'
                        ? 'bg-red-100 text-red-800'
                        : profileData.role === 'FORMATEUR'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {roleLabels[profileData.role]}
                  </span>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <IconUser size={14} className="mr-1" />
                    {profileData.email}
                  </div>
                </div>

                <p className="mb-4 text-sm text-muted-foreground">
                  Membre depuis le{' '}
                  {new Date(profileData.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                <div
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-muted/50"
                  onClick={() => setActiveTab('profile')}
                >
                  <IconDeviceFloppy size={14} />
                  <span className="text-sm text-blue-600">
                    Modifier le profil
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="rounded-xl border bg-card shadow-sm">
            {/* Navigation par onglets */}
            <div className="border-b border-border">
              <nav className="flex flex-wrap gap-1 p-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <IconUser size={16} className="mr-2" />
                  Informations personnelles
                </button>
                <button
                  onClick={() => setActiveTab('formations')}
                  className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'formations'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <IconSchool size={16} className="mr-2" />
                  Formations
                </button>
                <button
                  onClick={() => setActiveTab('attestations')}
                  className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'attestations'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <IconFileDownload size={16} className="mr-2" />
                  Certificats
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'password'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <IconLock size={16} className="mr-2" />
                  Sécurité
                </button>
              </nav>
            </div>

            {/* Contenu des onglets */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <form
                  onSubmit={profileForm.onSubmit(handleProfileSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Votre prénom"
                        required
                        className="w-full rounded-md border border-input px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                        {...profileForm.getInputProps('prenom')}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Votre nom"
                        required
                        className="w-full rounded-md border border-input px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                        {...profileForm.getInputProps('nom')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      required
                      className="w-full rounded-md border border-input px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                      {...profileForm.getInputProps('email')}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      className="w-full rounded-md border border-input px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                      {...profileForm.getInputProps('telephone')}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <IconDeviceFloppy size={16} className="mr-2" />
                      {updateProfile.isPending
                        ? 'Enregistrement...'
                        : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form
                  onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}
                  className="space-y-6"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Mot de passe actuel{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Votre mot de passe actuel"
                      required
                      className="w-full rounded-md border border-input px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                      {...passwordForm.getInputProps('currentPassword')}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Nouveau mot de passe{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Votre nouveau mot de passe"
                      required
                      className="w-full rounded-md border border-input px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                      {...passwordForm.getInputProps('newPassword')}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Confirmer le nouveau mot de passe{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Confirmez votre nouveau mot de passe"
                      required
                      className="w-full rounded-md border border-input px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                      {...passwordForm.getInputProps('confirmPassword')}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updatePassword.isPending}
                      className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <IconLock size={16} className="mr-2" />
                      {updatePassword.isPending
                        ? 'Modification...'
                        : 'Changer le mot de passe'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'formations' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Mes formations</h3>
                  {profileData.formations &&
                  profileData.formations.length > 0 ? (
                    <div className="grid gap-4">
                      {profileData.formations?.map((formation) => (
                        <div
                          key={formation.id}
                          className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-base font-medium">
                                {formation.titre}
                              </h4>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {formation.description}
                              </p>
                              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <IconCalendar size={14} />
                                  {new Date(
                                    formation.dateDebut
                                  ).toLocaleDateString('fr-FR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <IconClockHour4 size={14} />
                                  {formation.duree} heures
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  formation.statut === 'TERMINÉ'
                                    ? 'bg-green-100 text-green-800'
                                    : formation.statut === 'EN_COURS'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {formation.statut === 'TERMINÉ'
                                  ? 'Terminé'
                                  : formation.statut === 'EN_COURS'
                                    ? 'En cours'
                                    : 'Non commencé'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <IconSchool
                        size={48}
                        className="mx-auto mb-4 opacity-50"
                      />
                      <p>Vous n'avez aucune formation pour le moment.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'attestations' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Mes certificats</h3>
                  {profileData.attestations &&
                  profileData.attestations.length > 0 ? (
                    <div className="grid gap-4">
                      {profileData.attestations?.map((attestation) => (
                        <div
                          key={attestation.id}
                          className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-base font-medium">
                                {attestation.titre}
                              </h4>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {attestation.formation}
                              </p>
                              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <IconCalendar size={14} />
                                  Délivré le{' '}
                                  {new Date(
                                    attestation.dateDelivrance
                                  ).toLocaleDateString('fr-FR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <IconCheck size={14} />
                                  Validé
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <button
                                onClick={() =>
                                  handleDownloadAttestation(attestation.id)
                                }
                                className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                              >
                                <IconFileDownload size={16} className="mr-2" />
                                Télécharger
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <IconFileDownload
                        size={48}
                        className="mx-auto mb-4 opacity-50"
                      />
                      <p>
                        Vous n'avez aucun certificat disponible pour le moment.
                      </p>
                      <p className="mt-2 text-sm">
                        Les certificats apparaissent ici lorsque vous terminez
                        une formation.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
