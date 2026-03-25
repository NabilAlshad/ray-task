import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { User } from "@/types";
import { Users } from "lucide-react";

const COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500", 
  "bg-yellow-500", "bg-purple-500", "bg-pink-500", 
  "bg-indigo-500", "bg-teal-500"
];

const NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", 
  "Frank", "Grace", "Heidi", "Ivan", "Judy"
];

export function LiveUsers() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  useEffect(() => {
   
    const randomName = NAMES[Math.floor(Math.random() * NAMES.length)] + " " + Math.floor(Math.random() * 100);
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    
    const me: User = { id: "", name: randomName, color: randomColor };
    setCurrentUser(me);

    socket.on('connect', () => {
      me.id = socket.id || "local-" + Math.random().toString(36).substr(2, 5);
      setCurrentUser({ ...me });
      socket.emit('userJoined', me);
    
      setActiveUsers((prev) => [...prev, me].reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) return acc.concat([current]); else return acc;
      }, [] as User[]));
    });

    socket.on('userJoined', (user: User) => {
      setActiveUsers((prev) => {
        // Prevent duplicates
        if (prev.find(u => u.id === user.id)) return prev;
        return [...prev, user];
      });
      // Broadcast back so new user knows about us
      if (me.id) socket.emit('userJoined', me);
    });

    socket.on('userLeft', (userId: string) => {
      setActiveUsers((prev) => prev.filter(u => u.id !== userId));
    });

    return () => {
      socket.off('connect');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, []);

  if (!currentUser) return null;

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 border-b border-gray-200 shadow-sm w-full sticky top-0 z-10 h-14">
      <div className="flex items-center gap-2 text-gray-500 font-medium text-sm mr-auto">
        <Users className="w-4 h-4" />
        <span>Live Collaboration</span>
      </div>
      
      <div className="flex items-center">
        {activeUsers.map((user, i) => (
          <div 
            key={user.id} 
            title={`${user.name} ${user.id === currentUser.id ? '(You)' : ''}`}
            className={`w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm ${user.color} cursor-help transition-transform hover:scale-110 hover:z-20 relative`}
            style={{ zIndex: activeUsers.length - i }}
          >
            {user.name.charAt(0)}
          </div>
        ))}
        {activeUsers.length === 0 && (
          <div className="text-sm text-gray-400">Connecting...</div>
        )}
      </div>
      
      <div className="text-xs text-gray-400 hidden sm:block">
        Logged in as <span className="font-semibold text-gray-700">{currentUser.name}</span>
      </div>
    </div>
  );
}
