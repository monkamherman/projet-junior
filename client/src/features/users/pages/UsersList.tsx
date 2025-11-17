import { useState } from 'react';
import { 
  Table, 
  Text, 
  TextInput, 
  Select, 
  Group, 
  Button, 
  Paper, 
  Title, 
  ActionIcon, 
  Badge,
  Menu,
  Pagination,
  Center,
  Loader,
  Alert,
  Box,
  Modal
} from '@mantine/core';
import { IconSearch, IconDots, IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { useUsers } from '../hooks/useUsers';
import { User, UsersFilters } from '../types';
import { UserForm } from '../components/UserForm';
import { useDisclosure } from '@mantine/hooks';

const ROLES = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'FORMATEUR', label: 'Formateur' },
  { value: 'APPRENANT', label: 'Apprenant' },
];

export function UsersList() {
  const [filters, setFilters] = useState<UsersFilters>({
    page: 1,
    limit: 10,
  });
  
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const { data, isLoading, error } = useUsers(filters);
  
  const handleFilterChange = (key: keyof UsersFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}), // Reset to first page when filters change
    }));
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    open();
  };

  const handleCreate = () => {
    setSelectedUser(null);
    open();
  };

  if (isLoading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Erreur" mt="md">
        Une erreur est survenue lors du chargement des utilisateurs.
      </Alert>
    );
  }

  const rows = data?.data?.map((user: User) => (
    <tr key={user.id}>
      <td>
        <Text fw={500}>
          {user.prenom} {user.nom}
        </Text>
      </td>
      <td>{user.email}</td>
      <td>{user.telephone || '-'}</td>
      <td>
        <Badge
          color={
            user.role === 'ADMIN' 
              ? 'red' 
              : user.role === 'FORMATEUR' 
                ? 'blue' 
                : 'green'
          }
        >
          {ROLES.find(r => r.value === user.role)?.label || user.role}
        </Badge>
      </td>
      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <Group spacing={0} position="right">
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon>
                <IconDots size="1rem" stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                icon={<IconEdit size={16} />}
                onClick={() => handleEdit(user)}
              >
                Modifier
              </Menu.Item>
              <Menu.Item
                icon={<IconTrash size={16} />}
                color="red"
                // onClick={() => handleDelete(user.id)}
              >
                Supprimer
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </td>
    </tr>
  ));

  return (
    <Box>
      <Group position="apart" mb="md">
        <Title order={2}>Gestion des utilisateurs</Title>
        <Button 
          leftIcon={<IconPlus size={16} />} 
          onClick={handleCreate}
        >
          Ajouter un utilisateur
        </Button>
      </Group>

      <Paper withBorder p="md" mb="md">
        <Group spacing="md">
          <TextInput
            placeholder="Rechercher..."
            icon={<IconSearch size={16} />}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <Select
            placeholder="Tous les rôles"
            data={[
              { value: '', label: 'Tous les rôles' },
              ...ROLES,
            ]}
            value={filters.role || ''}
            onChange={(value) => handleFilterChange('role', value || undefined)}
            clearable
          />
        </Group>
      </Paper>

      <Paper withBorder>
        <Table>
          <thead>
            <tr>
              <th>Nom complet</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Date d'inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length ? (
              rows
            ) : (
              <tr>
                <td colSpan={6}>
                  <Text align="center" py="md" c="dimmed">
                    Aucun utilisateur trouvé
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Paper>

      {data?.pagination?.totalPages > 1 && (
        <Center mt="md">
          <Pagination
            value={filters.page}
            onChange={(page) => handleFilterChange('page', page)}
            total={data.pagination.totalPages}
          />
        </Center>
      )}

      <Modal 
        opened={opened} 
        onClose={close} 
        title={selectedUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
        size="lg"
      >
        <UserForm 
          user={selectedUser || undefined} 
          onSuccess={close} 
        />
      </Modal>
    </Box>
  );
}
