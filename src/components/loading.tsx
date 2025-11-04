// Loading Spinner Component
// Bu komponentni barcha sahifalardan import qilib ishlatish mumkin

import { Loader2 } from "lucide-react";

// Table Loading Skeleton
export const TableLoadingSkeleton = () => (
  <tbody>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i} className="border-b border-gray-700 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((j) => (
          <td key={j} className="p-3">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

// Button Loading Spinner
export const ButtonSpinner = () => (
  <Loader2 className="animate-spin" size={16} />
);

// Full Page Loading
export const FullPageLoader = ({ message = "Yuklanmoqda..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
    <Loader2 className="animate-spin mb-4 text-yellow-400" size={48} />
    <p className="text-lg">{message}</p>
  </div>
);

// Modal Overlay with Loading
export const ModalLoadingOverlay = () => (
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="animate-spin text-yellow-400" size={32} />
      <p className="text-sm text-gray-300">Yuklanmoqda...</p>
    </div>
  </div>
);

// Card Loading Skeleton
export const CardLoadingSkeleton = () => (
  <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4 animate-pulse">
    <div className="h-48 bg-gray-700 rounded-xl mb-3"></div>
    <div className="h-4 bg-gray-700 rounded mb-2"></div>
    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
  </div>
);