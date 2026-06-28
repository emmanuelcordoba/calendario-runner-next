'use client';

import { type ComponentProps } from 'react';

interface Props extends ComponentProps<'form'> {
    message?: string;
}

export default function DeleteButton({ message = '¿Eliminar este elemento?', ...formProps }: Props) {
    return (
        <form
            {...formProps}
            onSubmit={(e) => {
                if (!confirm(message)) e.preventDefault();
            }}
        >
            {formProps.children}
        </form>
    );
}
