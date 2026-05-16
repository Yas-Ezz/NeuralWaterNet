import React from 'react';
import { Clock } from 'lucide-react';

export function Tutorials() {
  const videos = [
    { 
      id: 1, 
      title: "Comment remplacer les filtres à eau", 
      duration: "3:45", 
      videoUrl: "https://www.youtube.com/embed/tPEE9ZwTmy0", 
      category: "Maintenance" 
    },
    { 
      id: 2, 
      title: "Comprendre le système de filtration", 
      duration: "2:20", 
      videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw", 
      category: "Utilisation" 
    },
    { 
      id: 3, 
      title: "Entretien de la pompe à eau", 
      duration: "4:10", 
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
      category: "Dépannage" 
    }
  ];

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-full">
      {videos.map(video => (
        <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative w-full aspect-video bg-black">
            <iframe 
              className="w-full h-full"
              src={video.videoUrl} 
              title={video.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">{video.category}</span>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} /> {video.duration}
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 leading-tight">{video.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
