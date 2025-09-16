import React, { useState } from 'react';
import { Box, Button, Tabs, Tab, Typography, Paper } from '@mui/material';

function TabStyleExample() {
  const [tabStyle, setTabStyle] = useState<'button' | 'muiTabs' | 'pill'>('button');
  const [mainTab, setMainTab] = useState<'summary' | 'problem'>('summary');

  const renderTabStyle = () => {
    switch (tabStyle) {
      case 'button':
        return (
          <Box display="flex" justifyContent="center" mb={3}>
            <Button
              variant={mainTab === 'summary' ? 'contained' : 'outlined'}
              onClick={() => setMainTab('summary')}
              sx={{ borderRadius: '8px 0 0 8px' }}
            >
              요약
            </Button>
            <Button
              variant={mainTab === 'problem' ? 'contained' : 'outlined'}
              onClick={() => setMainTab('problem')}
              sx={{ borderRadius: '0 8px 8px 0' }}
            >
              문제 생성
            </Button>
          </Box>
        );

      case 'muiTabs':
        return (
          <Tabs
            value={mainTab}
            onChange={(e, newValue) => setMainTab(newValue)}
            centered
          >
            <Tab value="summary" label="요약" />
            <Tab value="problem" label="문제 생성" />
          </Tabs>
        );

      case 'pill':
        return (
          <Box
            display="inline-flex"
            bgcolor="#e3f2fd"
            borderRadius="999px"
            p={0.5}
            mb={3}
            mx="auto"
          >
            <Button
              variant={mainTab === 'summary' ? 'contained' : 'text'}
              onClick={() => setMainTab('summary')}
              sx={{ borderRadius: '999px', textTransform: 'none', px: 4 }}
            >
              요약
            </Button>
            <Button
              variant={mainTab === 'problem' ? 'contained' : 'text'}
              onClick={() => setMainTab('problem')}
              sx={{ borderRadius: '999px', textTransform: 'none', px: 4 }}
            >
              문제 생성
            </Button>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6" mb={2}>탭 스타일 선택</Typography>
      <Box mb={3}>
        <Button onClick={() => setTabStyle('button')} sx={{ mr: 1 }}>버튼 탭</Button>
        <Button onClick={() => setTabStyle('muiTabs')} sx={{ mr: 1 }}>MUI Tabs</Button>
        <Button onClick={() => setTabStyle('pill')}>Pill 스타일</Button>
      </Box>

      {renderTabStyle()}

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        <Typography variant="body1">현재 선택된 탭: <strong>{mainTab === 'summary' ? '요약' : '문제 생성'}</strong></Typography>
      </Paper>
    </Box>
  );
}

export default TabStyleExample;
