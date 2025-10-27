import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Grid,
  Button,
} from "@mui/material";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

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
  showResult,
}: SequenceQuestionProps) {
  const questionText = question.question_text || "";
  const correctSequence = question.correct_sequence || [];

  // 항목 배열 가져오기 - 수정: items 배열이 없으면 빈 배열로 설정
  const items = question.items || [];

  // 디버깅용 콘솔 출력
  useEffect(() => {
    console.log("문제 데이터:", question);
    console.log("항목:", items);
  }, [question, items]);

  // 현재 순서 상태
  const [sequence, setSequence] = useState<number[]>([]);
  // 사용자 선택 상태
  const [selections, setSelections] = useState<{
    [position: number]: number | null;
  }>({});

  // 초기 로드 시 항목 및 선택 상태 초기화
  useEffect(() => {
    if (userAnswer && Array.isArray(userAnswer)) {
      // 이미 답변이 있으면 그대로 사용
      setSequence([...userAnswer]);

      // 선택 상태도 업데이트
      const initialSelections: { [position: number]: number | null } = {};
      userAnswer.forEach((itemId, index) => {
        initialSelections[index] = itemId;
      });
      setSelections(initialSelections);
    } else {
      // 답변이 없으면 초기화
      // 항목이 있는 경우 항목의 ID 배열 사용, 없으면 빈 배열
      const itemIds =
        Array.isArray(items) && items.length > 0
          ? items.map((item) => item.id)
          : [];

      setSequence(itemIds);

      // 선택 상태 초기화
      const initialSelections: { [position: number]: number | null } = {};
      Array.isArray(items) &&
        items.forEach((_, index) => {
          initialSelections[index] = null;
        });
      setSelections(initialSelections);
    }
  }, [items, onAnswer, userAnswer]);

  // 항목 선택 처리
  const handleSelection = (position: number, itemId: number) => {
    if (showResult) return; // 결과 표시 모드에서는 선택 불가

    // 이미 다른 위치에서 선택된 항목이라면 해당 위치의 선택을 해제
    const newSelections = { ...selections };

    // 같은 항목이 다른 위치에 선택되어 있는지 확인
    Object.keys(newSelections).forEach((pos) => {
      if (Number(pos) !== position && newSelections[Number(pos)] === itemId) {
        newSelections[Number(pos)] = null;
      }
    });

    // 현재 위치에 항목 선택
    newSelections[position] = itemId;
    setSelections(newSelections);

    // 선택 사항에 따라 순서 업데이트
    const newSequence = Object.values(newSelections).filter(
      (item) => item !== null
    ) as number[];
    setSequence(newSequence);
    onAnswer(newSequence);
  };

  // 다시 선택하기 버튼 핸들러
  const handleReset = () => {
    if (showResult) return; // 결과 표시 모드에서는 리셋 불가

    // 선택 상태 초기화
    const initialSelections: { [position: number]: number | null } = {};
    items.forEach((_, index) => {
      initialSelections[index] = null;
    });
    setSelections(initialSelections);
    setSequence([]);
    onAnswer([]);
  };

  // 현재 시퀀스에서 항목 ID로 항목 객체 찾기
  const getItemById = (id: number) => {
    if (!Array.isArray(items)) return { id, text: `항목 ${id}` };
    return items.find((item) => item.id === id) || { id, text: `항목 ${id}` };
  };

  // 특정 항목이 정답 위치에 있는지 확인
  const isCorrectPosition = (id: number, index: number) => {
    return showResult && correctSequence[index] === id;
  };

  // 특정 항목이 오답 위치에 있는지 확인
  const isWrongPosition = (id: number, index: number) => {
    return showResult && correctSequence[index] !== id;
  };

  // 항목이 없으면 안내 메시지 표시
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {questionText}
        </Typography>
        <Paper elevation={1} sx={{ mt: 3, p: 2 }}>
          <Typography variant="body1" color="error">
            문제의 보기 항목이 없습니다. 문제 데이터를 확인해주세요.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {questionText}
      </Typography>

      <Paper elevation={1} sx={{ mt: 3, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1">
            각 위치에 올바른 항목을 선택하세요.
          </Typography>
          {!showResult && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              disabled={Object.values(selections).every((s) => s === null)}
            >
              다시 선택하기
            </Button>
          )}
        </Box>

        <List sx={{ width: "100%" }}>
          {items.map((item, position) => {
            return (
              <React.Fragment key={`position-${position}`}>
                {position > 0 && <Divider />}
                <ListItem
                  sx={{
                    bgcolor: "background.paper",
                    p: 2,
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                        }}
                      >
                        {position + 1}번째
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={8}>
                      <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                          value={selections[position] || ""}
                          onChange={(e) =>
                            handleSelection(position, Number(e.target.value))
                          }
                        >
                          <Grid container spacing={1}>
                            {items.map((option) => (
                              <Grid
                                item
                                xs={12}
                                md={6}
                                key={`option-${option.id}-pos-${position}`}
                              >
                                <FormControlLabel
                                  value={option.id}
                                  control={<Radio disabled={showResult} />}
                                  label={option.text}
                                  disabled={
                                    showResult ||
                                    (selections[position] !== option.id &&
                                      Object.values(selections).includes(
                                        option.id
                                      ))
                                  }
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>
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