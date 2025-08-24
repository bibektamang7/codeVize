// import React from 'react';
// import { LuPlus, LuPencil, LuShare2, LuMoreVertical } from "lucide-react";
// import { FaRedditAlien, FaMeta, FaSearchengin } from "react-icons/fa";

// // The lucide-react library is also not being resolved correctly.
// // I'll be replacing the icons with inline SVGs to ensure they render properly.

// const PlusIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
//     <path d="M5 12h14" />
//     <path d="M12 5v14" />
//   </svg>
// );

// const PencilIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
//     <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
//   </svg>
// );

// const Share2Icon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2">
//     <circle cx="18" cy="5" r="3" />
//     <circle cx="6" cy="12" r="3" />
//     <circle cx="18" cy="19" r="3" />
//     <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
//     <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
//   </svg>
// );

// const MoreVerticalIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical">
//     <circle cx="12" cy="12" r="1" />
//     <circle cx="12" cy="5" r="1" />
//     <circle cx="12" cy="19" r="1" />
//   </svg>
// );

// const FontAwesomeScript = () => {
//   React.useEffect(() => {
//     const script = document.createElement('script');
//     script.src = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/js/all.min.js";
//     script.async = true;
//     document.body.appendChild(script);
//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);
//   return null;
// };


// const App = () => {
//   return (
//     <div className="bg-[#1e1e1e] text-white font-sans antialiased min-h-screen p-8 flex items-center justify-center overflow-hidden relative">
//       <FontAwesomeScript />
//       {/* Background patterns and gradients */}
//       <div className="absolute inset-0 z-0">
//         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full"></div>
//         <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-96 h-96 bg-green-500/20 blur-[100px] rounded-full"></div>
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-transparent via-[#2a2a2a] to-transparent opacity-50"></div>
//       </div>

//       {/* Main container with content */}
//       <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-6">
        
//         {/* Top Header Section */}
//         <div className="flex justify-between items-center bg-[#2a2a2a] bg-opacity-70 backdrop-blur-sm rounded-3xl p-4 shadow-xl">
//           <div className="flex items-center space-x-4">
//             <span className="text-xl font-bold text-gray-400">Your Logo</span>
//             <div className="flex space-x-2">
//               <div className="w-12 h-6 bg-green-500/50 rounded-full"></div>
//               <div className="w-12 h-6 bg-gray-600 rounded-full"></div>
//             </div>
//           </div>
//           <div className="flex space-x-2">
//             <div className="w-8 h-8 rounded-full bg-gray-600"></div>
//             <div className="w-8 h-8 rounded-full bg-gray-600"></div>
//             <div className="w-8 h-8 rounded-full bg-gray-600"></div>
//           </div>
//         </div>

//         {/* Content Area */}
//         <div className="flex flex-wrap lg:flex-nowrap gap-6">

//           {/* Left Column (Sketch-like component) */}
//           <div className="w-full lg:w-1/4 bg-[#2a2a2a] bg-opacity-70 backdrop-blur-sm rounded-3xl p-6 shadow-xl flex flex-col gap-4">
//             <div className="flex justify-between items-center text-gray-400">
//               <div className="flex space-x-2">
//                 <div className="bg-[#1e1e1e] p-2 rounded-xl border border-[#3e3e3e]">
//                   <PlusIcon />
//                 </div>
//                 <div className="bg-[#1e1e1e] p-2 rounded-xl border border-[#3e3e3e]">
//                   <PencilIcon />
//                 </div>
//                 <div className="bg-[#1e1e1e] p-2 rounded-xl border border-[#3e3e3e]">
//                   <Share2Icon />
//                 </div>
//               </div>
//               <MoreVerticalIcon />
//             </div>

//             <div className="relative border border-dashed border-gray-500 p-4 rounded-xl space-y-4">
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-4 rounded-full bg-gray-500"></div>
//                 <span className="text-sm font-light text-gray-400">Attached</span>
//               </div>
//               <div className="flex items-center space-x-2 bg-gray-700/50 rounded-full pr-2">
//                 <div className="w-6 h-6 rounded-full bg-yellow-500/80 m-1"></div>
//                 <span className="text-sm">Brayan Singer</span>
//                 <div className="w-4 h-4 rounded-full bg-green-500 ml-auto"></div>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-6 h-6 rounded-full bg-green-500/80"></div>
//                 <span className="text-sm">Kim</span>
//               </div>
//             </div>

//             <button className="bg-gray-700/50 text-sm py-2 px-4 rounded-full mt-auto">
//               GET STARTED
//             </button>
//           </div>

//           {/* Middle Column (Data Visualization) */}
//           <div className="w-full lg:w-2/4 bg-[#2a2a2a] bg-opacity-70 backdrop-blur-sm rounded-3xl p-6 shadow-xl flex flex-col items-start relative overflow-hidden">
//             <div className="flex items-center justify-center space-x-4 mb-4">
//               <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
//                 <i className="fab fa-meta text-gray-400" style={{ fontSize: '24px' }}></i>
//               </div>
//               <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
//                 <i className="fab fa-reddit-alien text-gray-400" style={{ fontSize: '24px' }}></i>
//               </div>
//               <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
//                 <i className="fas fa-search-engine text-gray-400" style={{ fontSize: '24px' }}></i>
//               </div>
//             </div>

//             <h2 className="text-6xl font-bold mb-2">98.2<span className="text-2xl font-normal">%</span></h2>
//             <div className="text-sm text-green-400 font-light mb-4">
//               Startups . <span className="text-gray-400">WorldWide</span>
//             </div>
//             <p className="text-sm text-gray-400 max-w-sm">
//               Over 2 Millions of Startups at Worldwide, Already Work with Us and Growth their Business!
//             </p>

//             {/* Hexagon grid background effect */}
//             <div className="absolute inset-0 opacity-10 pointer-events-none">
//               <div className="absolute -bottom-10 -right-20">
//                 <div className="relative w-96 h-96">
//                   {Array.from({ length: 6 }).map((_, i) => (
//                     <div
//                       key={i}
//                       className="absolute rounded-full w-24 h-24 bg-gray-500/50 animate-pulse"
//                       style={{
//                         animationDelay: `${i * 0.2}s`,
//                         left: `${Math.cos((i / 6) * 2 * Math.PI) * 120 + 120}px`,
//                         top: `${Math.sin((i / 6) * 2 * Math.PI) * 120 + 120}px`,
//                         clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
//                       }}
//                     ></div>
//                   ))}
//                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/80 rounded-full flex items-center justify-center">
//                     <div className="w-16 h-16 bg-white rounded-full"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column (Flowchart-like component) */}
//           <div className="w-full lg:w-1/4 bg-[#2a2a2a] bg-opacity-70 backdrop-blur-sm rounded-3xl p-6 shadow-xl flex flex-col justify-center items-center relative overflow-hidden">
//             {/* Background dots */}
//             <div className="absolute inset-0 pointer-events-none opacity-20 bg-repeat [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

//             <div className="relative z-10 flex flex-col items-center">
//               <div className="w-20 h-20 rounded-full bg-gray-500/50 flex items-center justify-center border-2 border-gray-400 relative">
//                 <div className="w-16 h-16 rounded-full bg-blue-500/80 border-2 border-blue-400"></div>
//                 <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-500/80 flex items-center justify-center text-xs font-bold text-gray-800 border-2 border-yellow-400">
//                   <span className="text-lg">A</span>
//                 </div>
//               </div>
//               <div className="flex flex-col items-center mt-8">
//                 <div className="w-24 h-12 bg-green-500/80 rounded-2xl flex items-center justify-center mb-4">
//                   <span className="font-semibold text-lg">API</span>
//                 </div>
//                 <div className="w-16 h-16 rounded-full bg-green-500/80"></div>
//               </div>
//             </div>
            
//             {/* Arrows with dotted lines */}
//             <svg className="absolute w-full h-full inset-0 z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
//               <defs>
//                 <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="5" refY="3.5" orient="auto">
//                   <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
//                 </marker>
//               </defs>
//               <line x1="25" y1="40" x2="60" y2="40" strokeDasharray="5,5" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
//               <line x1="60" y1="40" x2="60" y2="70" strokeDasharray="5,5" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
//               <line x1="60" y1="70" x2="80" y2="70" strokeDasharray="5,5" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
//             </svg>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;
