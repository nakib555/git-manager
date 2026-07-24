#!/bin/bash
sed -i "s/import React, { useState } from 'react';/import React, { useState } from 'react';\nimport { motion, AnimatePresence } from 'motion\/react';/g" src/components/CreateModals.tsx

sed -i "s/  if (!activeModal) return null;/  /g" src/components/CreateModals.tsx

sed -i "s/  return (/  return (\n    <AnimatePresence>\n      {activeModal && (/g" src/components/CreateModals.tsx

sed -i "s/<div className=\"fixed inset-0 z-\[200\] flex items-center justify-center p-4 sm:p-6\">/<motion.div \n        initial={{ opacity: 0 }}\n        animate={{ opacity: 1 }}\n        exit={{ opacity: 0 }}\n        transition={{ duration: 0.15 }}\n        className=\"fixed inset-0 z-\[200\] flex items-center justify-center p-4 sm:p-6\"\n      >/g" src/components/CreateModals.tsx

sed -i "s/className=\"absolute inset-0 bg-black\/60 backdrop-blur-sm transition-opacity duration-300 opacity-100\"/className=\"absolute inset-0 bg-black\/60 backdrop-blur-sm\"/g" src/components/CreateModals.tsx

sed -i "s/<div className=\"relative w-full max-w-\[420px\] max-h-\[90vh\] overflow-y-auto bg-card rounded-2xl border border-border p-6 shadow-2xl animate-fade-up\">/<motion.div \n          initial={{ opacity: 0, scale: 0.95, y: 10 }}\n          animate={{ opacity: 1, scale: 1, y: 0 }}\n          exit={{ opacity: 0, scale: 0.95, y: 10 }}\n          transition={{ duration: 0.15, ease: \"easeOut\" }}\n          className=\"relative w-full max-w-\[420px\] max-h-\[90vh\] overflow-y-auto bg-card rounded-2xl border border-border p-6 shadow-2xl\"\n        >/g" src/components/CreateModals.tsx

sed -i "s/    <\/div>\n  );/        <\/motion.div>\n      <\/motion.div>\n      )}\n    <\/AnimatePresence>\n  );/g" src/components/CreateModals.tsx
