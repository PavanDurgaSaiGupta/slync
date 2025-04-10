
import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Download, Upload, File, FileText, BookOpen, CheckSquare, Github } from 'lucide-react';
import NeonButton from './NeonButton';

type DataType = 'notes' | 'todos' | 'bookmarks';

interface ImportExportManagerProps {
  type: DataType;
  onImport: (data: any) => void;
  onExport?: () => void;
  data?: any;
}

const formatDescriptions = {
  notes: [
    { ext: 'md', name: 'Markdown', description: 'Standard format with tags support' },
    { ext: 'txt', name: 'Text', description: 'Plain text without formatting' },
    { ext: 'html', name: 'HTML', description: 'Rich text with formatting' },
  ],
  todos: [
    { ext: 'md', name: 'Markdown', description: 'Tasks with checkboxes' },
    { ext: 'csv', name: 'CSV', description: 'Spreadsheet format with due dates & priorities' },
    { ext: 'ics', name: 'iCalendar', description: 'Calendar format with reminders' },
  ],
  bookmarks: [
    { ext: 'json', name: 'JSON', description: 'Structured data with collections & tags' },
    { ext: 'html', name: 'HTML', description: 'Browser export format' },
    { ext: 'csv', name: 'CSV', description: 'Simple list format' },
  ],
};

const typeIcons = {
  notes: <FileText className="mr-2" size={18} />,
  todos: <CheckSquare className="mr-2" size={18} />,
  bookmarks: <BookOpen className="mr-2" size={18} />,
};

const ImportExportManager: React.FC<ImportExportManagerProps> = ({ type, onImport, onExport, data }) => {
  const [selectedFormat, setSelectedFormat] = useState(formatDescriptions[type][0].ext);
  const { repo } = useAuthStore();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsedData;
        
        if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(content);
        } else if (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.html')) {
          parsedData = content;
        } else if (file.name.endsWith('.csv')) {
          parsedData = content.split('\n').map(line => line.split(','));
        } else {
          toast.error(`Unsupported file format: ${file.name}`);
          return;
        }
        
        onImport(parsedData);
        toast.success(`Imported ${file.name} successfully!`);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import file. Check the format and try again.');
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    
    if (file.name.endsWith('.json') || file.name.endsWith('.md') || 
        file.name.endsWith('.txt') || file.name.endsWith('.csv') || 
        file.name.endsWith('.html')) {
      reader.readAsText(file);
    } else {
      toast.error(`Unsupported file format: ${file.name}`);
    }
  };

  const handleExport = () => {
    try {
      let content = '';
      let fileName = `slync-${type}-${new Date().toISOString().split('T')[0]}`;
      let mimeType = 'text/plain';
      
      switch (selectedFormat) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          fileName += '.json';
          mimeType = 'application/json';
          break;
          
        case 'md':
          if (type === 'notes') {
            content = data;
          } else if (type === 'todos') {
            content = data.map((todo: any) => 
              `- [${todo.completed ? 'x' : ' '}] ${todo.title} ${todo.dueDate ? `(Due: ${todo.dueDate})` : ''}`
            ).join('\n');
          } else if (type === 'bookmarks') {
            content = data.map((bookmark: any) => 
              `- [${bookmark.title}](${bookmark.url}) ${bookmark.tags ? `#${bookmark.tags.join(' #')}` : ''}`
            ).join('\n');
          }
          fileName += '.md';
          mimeType = 'text/markdown';
          break;
          
        case 'html':
          if (type === 'notes') {
            content = `<html><body>${data}</body></html>`;
          } else if (type === 'bookmarks') {
            content = `<html><body><h1>SLYNC Bookmarks</h1><ul>
              ${data.map((bookmark: any) => `<li><a href="${bookmark.url}">${bookmark.title}</a></li>`).join('')}
              </ul></body></html>`;
          }
          fileName += '.html';
          mimeType = 'text/html';
          break;
          
        case 'csv':
          if (type === 'todos') {
            content = 'Title,Completed,Due Date\n' + 
              data.map((todo: any) => `"${todo.title}",${todo.completed},${todo.dueDate || ''}`).join('\n');
          } else if (type === 'bookmarks') {
            content = 'Title,URL,Tags\n' + 
              data.map((bookmark: any) => `"${bookmark.title}","${bookmark.url}","${bookmark.tags?.join(' ') || ''}"`).join('\n');
          }
          fileName += '.csv';
          mimeType = 'text/csv';
          break;
          
        case 'ics':
          content = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SLYNC//EN
${data.map((todo: any) => `BEGIN:VTODO
SUMMARY:${todo.title}
STATUS:${todo.completed ? 'COMPLETED' : 'NEEDS-ACTION'}
${todo.dueDate ? `DUE:${todo.dueDate.replace(/-/g, '')}` : ''}
END:VTODO`).join('\n')}
END:VCALENDAR`;
          fileName += '.ics';
          mimeType = 'text/calendar';
          break;
          
        default:
          content = JSON.stringify(data, null, 2);
          fileName += '.json';
          mimeType = 'application/json';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${fileName} successfully!`);
      
      if (onExport) {
        onExport();
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="matrix-card p-4">
      <h3 className="text-matrix-primary text-lg font-bold mb-4 flex items-center">
        {typeIcons[type]} Import/Export {type.charAt(0).toUpperCase() + type.slice(1)}
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-matrix-primary/90 mb-2">Import from file:</h4>
          <div className="flex items-center">
            <label className="flex-1">
              <input
                type="file"
                accept={`.${formatDescriptions[type].map(f => f.ext).join(',.') }`}
                onChange={handleImport}
                className="hidden"
              />
              <NeonButton className="w-full flex items-center justify-center" onClick={() => {}}>
                <Upload size={16} className="mr-2" />
                Select {type.charAt(0).toUpperCase() + type.slice(1)} File
              </NeonButton>
            </label>
          </div>
          
          <div className="mt-2 text-xs text-matrix-primary/60">
            Supported formats: {formatDescriptions[type].map(f => f.name).join(', ')}
          </div>
        </div>
        
        <div className="border-t border-matrix-primary/20 pt-4">
          <h4 className="text-matrix-primary/90 mb-2">Export to file:</h4>
          <div className="grid grid-cols-1 gap-2 mb-4">
            {formatDescriptions[type].map((format) => (
              <div key={format.ext} className="flex items-center">
                <input
                  type="radio"
                  id={`format-${format.ext}`}
                  name="exportFormat"
                  value={format.ext}
                  checked={selectedFormat === format.ext}
                  onChange={() => setSelectedFormat(format.ext)}
                  className="mr-2 accent-matrix-primary"
                />
                <label htmlFor={`format-${format.ext}`} className="flex-1 text-matrix-primary/90">
                  <span className="font-semibold">.{format.ext}</span> - {format.name}
                  <div className="text-xs text-matrix-primary/60">{format.description}</div>
                </label>
              </div>
            ))}
          </div>
          
          <NeonButton 
            className="w-full flex items-center justify-center" 
            onClick={handleExport}
            disabled={!data}
          >
            <Download size={16} className="mr-2" />
            Export as .{selectedFormat}
          </NeonButton>
        </div>
        
        <div className="border-t border-matrix-primary/20 pt-4 text-center">
          <p className="text-xs text-matrix-primary/60 mb-1">
            All changes are automatically synced to your GitHub repository
          </p>
          {repo && (
            <a 
              href={repo.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-matrix-primary/80 hover:text-matrix-primary underline flex items-center justify-center"
            >
              <Github size={12} className="mr-1" />
              {repo.owner}/{repo.name}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExportManager;
