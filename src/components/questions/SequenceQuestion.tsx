import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider
} from '@mui/material';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

interface SequenceQuestionProps {
  question: any;
  userAnswer: number[] | null;
  onAnswer: (answer: number[]) => void;
  showResult: boolean;
}

export default function SequenceQuestion({
  question,
  userAnswer,
  onAnswer,
  showResult
}: SequenceQuestionProps) {
  const questionText = question.question_text || '';
  const correctSequence = question.correct_sequence || [];
  
  // 항목 배열 가져오기
  const items = question.items || [];

  // 현재 순서 상태
  const [sequence, setSequence] = useState<number[]>([]);

  // 초기 로드 시 항목 섞기
  useEffect(() => {
    if (userAnswer && Array.isArray(userAnswer)) {
      // 이미 답변이 있으면 그대로 사용
      setSequence([...userAnswer]);
    } else {
      // 답변이 없으면 무작위로 섞기
      const shuffled = [...items.map(item => item.id)]
        .sort(() => Math.random() - 0.5);
      setSequence(shuffled);
      onAnswer(shuffled);
    }
  }, [items, onAnswer, userAnswer]);

  // 항목 이동 처리
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (showResult) return; // 결과 표시 모드에서는 이동 불가
    
    const newSequence = [...sequence];
    const [movedItem] = newSequence.splice(fromIndex, 1);
    newSequence.splice(toIndex, 0, movedItem);
    
    setSequence(newSequence);
    onAnswer(newSequence);
  };

  // 항목을 위로 이동
  const moveUp = (index: number) => {
    if (index > 0) {
      moveItem(index, index - 1);
    }
  };

  // 항목을 아래로 이동
  const moveDown = (index: number) => {
    if (index < sequence.length - 1) {
      moveItem(index, index + 1);
    }
  };

  // 현재 시퀀스에서 항목 ID로 항목 객체 찾기
  const getItemById = (id: number) => {
    return items.find(item => item.id === id) || { id, text: `항목 ${id}` };
  };

  // 특정 항목이 정답 위치에 있는지 확인
  const isCorrectPosition = (id: number, index: number) => {
    return showResult && correctSequence[index] === id;
  };

  // 특정 항목이 오답 위치에 있는지 확인
  const isWrongPosition = (id: number, index: number) => {
    return showResult && correctSequence[index] !== id;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {questionText}
      </Typography>

      <Paper elevation={1} sx={{ mt: 3 }}>
        <List sx={{ width: '100%' }}>
          {sequence.map((id, index) => {
            const item = getItemById(id);
            
            return (
              <React.Fragment key={id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    bgcolor: isCorrectPosition(id, index)
                      ? 'success.light'
                      : isWrongPosition(id, index)
                      ? 'error.light'
                      : 'background.paper',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <DragHandleIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>
                          {index + 1}. {item.text}
                        </Typography>
                        {showResult && isCorrectPosition(id, index) && (
                          <CheckCircleOutlineIcon color="success" sx={{ ml: 1 }} />
                        )}
                        {showResult && isWrongPosition(id, index) && (
                          <CancelOutlinedIcon color="error" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    }
                  />
                  {!showResult && (
                    <Box>
                      <IconButton 
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        size="small"
                      >
                        <ArrowUpwardIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => moveDown(index)}
                        disabled={index === sequence.length - 1}
                        size="small"
                      >
                        <ArrowDownwardIcon />
                      </IconButton>
                    </Box>
                  )}
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
      
      {showResult && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            정답 순서:
          </Typography>
          <List dense>
            {correctSequence.map((id, index) => {
              const item = getItemById(id);
              return (
                <ListItem key={`correct-${id}`}>
                  <ListItemText primary={`${index + 1}. ${item.text}`} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
}
