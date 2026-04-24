export const exportUserData = () => {
  try {
    const keysToExport = [
      'subjects', // legacy
      'themes',
      'cycle_states',
      'questions',
      'studyHistory',
      'userStats',
      'archived_enemies',
      'pomodoro_settings',
      'goals',
      'unlockedAchievements'
    ];

    const exportData: Record<string, any> = {};

    keysToExport.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          exportData[key] = JSON.parse(item);
        } catch (e) {
          exportData[key] = item; // fallback to string if not JSON
        }
      }
    });

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    
    const date = new Date().toISOString().split('T')[0];
    a.download = `ciclo-de-estudos-backup-${date}.json`;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};
