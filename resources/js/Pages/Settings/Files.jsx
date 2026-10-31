import { Head, router } from '@inertiajs/react';
import { FileText, Trash2 } from 'lucide-react';
import { Badge, Card, EmptyState, IconButton } from '@/Components/ui';
import SettingsLayout from '@/Layouts/SettingsLayout';
import { api, formatBytes } from '@/lib/api';

function List({ files }) {
    if (!files.length) return <EmptyState title="Keine Dateien" />;

    const remove = async (f) => {
        if (!window.confirm(`„${f.name}“ endgültig löschen?`)) return;
        await api.delete(route('files.destroy', f.id));
        router.reload({ only: ['files', 'generated'] });
    };

    return (
        <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 py-2.5">
                    <FileText className="h-5 w-5 shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                        <a href={route('files.show', { file: f.id, download: 1 })} className="block truncate text-sm font-medium hover:underline">{f.name}</a>
                        <p className="text-xs text-gray-500">{formatBytes(f.size)} · {f.mime}</p>
                    </div>
                    <Badge color={f.status === 'ready' ? 'green' : f.status === 'failed' ? 'red' : 'gray'}>{f.status}</Badge>
                    <IconButton label="Löschen" onClick={() => remove(f)}><Trash2 className="h-4 w-4" /></IconButton>
                </li>
            ))}
        </ul>
    );
}

export default function Files({ files, generated }) {
    return (
        <SettingsLayout title="Dateien">
            <Head title="Dateien" />
            <Card title="Hochgeladene Dateien" description="Nur du siehst diese Dateien. Gelöschte Dateien werden samt extrahiertem Text und Suchindex entfernt."><List files={files} /></Card>
            <Card title="Von der KI erstellt" description="Dokumente und Bilder, die in deinen Chats erzeugt wurden."><List files={generated} /></Card>
        </SettingsLayout>
    );
}
