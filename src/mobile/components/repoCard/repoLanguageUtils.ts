export const getLanguageColor = (lang?: string | null): string => {
  switch (lang?.toLowerCase()) {
    case 'typescript':
      return '#3178C6';
    case 'javascript':
      return '#F7DF1E';
    case 'python':
      return '#3572A5';
    case 'rust':
      return '#DEA584';
    case 'go':
      return '#00ADD8';
    case 'html':
      return '#E34C26';
    case 'css':
      return '#563D7C';
    case 'c++':
    case 'cpp':
      return '#F34B7D';
    case 'c':
      return '#555555';
    case 'c#':
    case 'csharp':
      return '#178600';
    case 'java':
      return '#B07219';
    case 'kotlin':
      return '#A97BFF';
    case 'swift':
      return '#F05138';
    case 'ruby':
      return '#701516';
    case 'php':
      return '#4F5D95';
    case 'shell':
    case 'bash':
      return '#89E051';
    case 'dart':
      return '#00B4AB';
    case 'vue':
      return '#41B883';
    case 'svelte':
      return '#FF3E00';
    case 'markdown':
      return '#083FA1';
    default:
      return '#8B949E';
  }
};
