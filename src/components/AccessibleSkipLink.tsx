/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Accessible Skip Link
 * Enables keyboard and screen-reader users to skip repetitive navigation
 * and jump straight to the primary interactive content.
 */

import React from "react";

export const AccessibleSkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-5 focus:py-3 focus:bg-blue-600 focus:text-white focus:font-bold focus:text-sm focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400"
    >
      ပင်မအကြောင်းအရာသို့ တိုက်ရိုက်သွားမည် (Skip to Main Content)
    </a>
  );
};
