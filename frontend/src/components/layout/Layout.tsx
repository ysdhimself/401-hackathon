import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ToastContainer } from '@/components/ui/Toast';

export function Layout() {
  const uniqueEmojis = ['💼', '📝', '📄', '🔍', '✉️', '🎯', '💻', '📊', '🎓', '🌟', '👔', '💡', '📈', '🏆'];
  
  // Shuffle function to randomize emoji order
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Create emoji array with shuffled repetition to avoid adjacent duplicates
  const jobEmojis: string[] = [];
  while (jobEmojis.length < 80) {
    let shuffled = shuffleArray(uniqueEmojis);
    // If the last emoji matches the first of the new batch, reshuffle
    if (jobEmojis.length > 0 && jobEmojis[jobEmojis.length - 1] === shuffled[0]) {
      // Keep shuffling until we get a different first emoji
      while (jobEmojis[jobEmojis.length - 1] === shuffled[0] && uniqueEmojis.length > 1) {
        shuffled = shuffleArray(uniqueEmojis);
      }
    }
    jobEmojis.push(...shuffled);
  }
  const finalEmojis = jobEmojis.slice(0, 80);
  
  return (
    <div className="min-h-screen bg-[#E5F5F7] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        {finalEmojis.map((emoji, index) => (
          <div
            key={index}
            className="absolute text-4xl opacity-25 animate-float"
            style={{
              left: `${(index * 7) % 100}%`,
              top: `${(index * 11) % 100}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${15 + (index % 10)}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    </div>
  );
}
