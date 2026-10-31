import { Head, useForm } from '@inertiajs/react';
import { Button, Card, Field, Input, Textarea, Toggle } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Settings({ definitions, values }) {
    const form = useForm({ values });
    const set = (key, value) => form.setData('values', { ...form.data.values, [key]: value });
    const groups = definitions.reduce((acc, d) => ({ ...acc, [d.group]: [...(acc[d.group] || []), d] }), {});

    const submit = (e) => {
        e.preventDefault();
        form.patch(route('admin.settings.update'), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Plattform">
            <Head title="Plattform" />
            <form onSubmit={submit} className="space-y-6">
                {Object.entries(groups).map(([group, defs]) => (
                    <Card key={group} title={group} description={group === 'OAuth' ? 'Login mit Google oder GitHub wird erst angezeigt, wenn Client-ID und Secret gesetzt sind. Callback-URLs: /auth/google/callback bzw. /auth/github/callback.' : undefined}>
                        <div className="space-y-4">
                            {defs.map((d) => {
                                const v = form.data.values[d.key];
                                if (d.type === 'bool') return <Toggle key={d.key} checked={!!v} onChange={(x) => set(d.key, x)} label={d.label} />;
                                if (d.type === 'text') return <Field key={d.key} label={d.label} hint="Wird jedem Gespräch als System-Anweisung vorangestellt." error={form.errors[`values.${d.key}`]}><Textarea rows={5} value={v ?? ''} onChange={(e) => set(d.key, e.target.value)} /></Field>;
                                return <Field key={d.key} label={d.label} hint={d.secret ? 'Verschlüsselt gespeichert. ******** = unverändert.' : undefined} error={form.errors[`values.${d.key}`]}><Input type={d.secret ? 'password' : d.type === 'int' ? 'number' : 'text'} autoComplete="off" value={v ?? ''} onChange={(e) => set(d.key, d.type === 'int' ? Number(e.target.value) : e.target.value)} /></Field>;
                            })}
                        </div>
                    </Card>
                ))}
                <div className="flex justify-end"><Button type="submit" loading={form.processing}>Speichern</Button></div>
            </form>
        </AdminLayout>
    );
}
