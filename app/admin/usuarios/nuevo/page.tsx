export const dynamic = 'force-dynamic';

import UserForm from '../user-form';
export default function NuevoUsuarioPage() {
    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Nuevo usuario</h1>
            <UserForm />
        </div>
    );
}
