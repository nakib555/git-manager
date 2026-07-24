#!/bin/bash
sed -i "s/import React, { useState, useRef, useEffect } from 'react';/import React, { useState, useRef, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion\/react';/g" src/screens/Dashboard.tsx

sed -i "s/{isDropdownOpen && (/<AnimatePresence>\n          {isDropdownOpen && (\n            <motion.div\n              initial={{ opacity: 0, y: -5 }}\n              animate={{ opacity: 1, y: 0 }}\n              exit={{ opacity: 0, y: -5 }}\n              transition={{ duration: 0.15 }}\n              className=\"absolute right-0 top-6 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10 w-32 py-1\"\n            >/g" src/screens/Dashboard.tsx

sed -i "s/<div className=\"absolute right-0 top-6 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10 w-32 py-1\">//g" src/screens/Dashboard.tsx

sed -i "s/              )}/              )}\n            <\/motion.div>\n          )}\n          <\/AnimatePresence>/g" src/screens/Dashboard.tsx
