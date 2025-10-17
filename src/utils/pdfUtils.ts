import { jsPDF } from 'jspdf'
import { Question } from '../types/upload'
import 'jspdf-autotable'

// 문제 유형에 따른 HTML 생성 함수들
const renderMultipleChoiceHTML = (question: Question, index: number): string => {
  const options = question.options?.map(option => 
    `<p style="margin-left:20px;margin-bottom:5px;">${option.id}. ${option.text}</p>`
  ).join('') || '';
  
  return `
    <div style="margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #eee;">
      <h3>문제 ${index + 1}: ${question.question_text}</h3>
      ${options ? `<div style="margin-top:10px;margin-bottom:10px;"><p style="font-weight:bold;">보기:</p>${options}</div>` : ''}
      <div style="background-color:#e6f7e6;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">답: ${question.correct_answer}</p>
      </div>
      ${question.explanation ? `
      <div style="background-color:#e6f0ff;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">해설:</p>
        <p>${question.explanation}</p>
      </div>
      ` : ''}
    </div>
  `;
}

const renderSequenceHTML = (question: Question, index: number): string => {
  const items = question.items?.map(item => 
    `<p style="margin-left:20px;margin-bottom:5px;">${item.id}. ${item.text}</p>`
  ).join('') || '';
  
  return `
    <div style="margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #eee;">
      <h3>문제 ${index + 1}: ${question.question_text}</h3>
      ${items ? `<div style="margin-top:10px;margin-bottom:10px;"><p style="font-weight:bold;">선택지:</p>${items}</div>` : ''}
      <div style="background-color:#e6f7e6;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">정답 순서: ${question.correct_sequence?.join(' → ')}</p>
      </div>
      ${question.explanation ? `
      <div style="background-color:#e6f0ff;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">해설:</p>
        <p>${question.explanation}</p>
      </div>
      ` : ''}
    </div>
  `;
}

const renderTrueFalseHTML = (question: Question, index: number): string => {
  return `
    <div style="margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #eee;">
      <h3>문제 ${index + 1}: ${question.question_text}</h3>
      <p style="margin-top:10px;font-weight:bold;">보기: 참 / 거짓</p>
      <div style="background-color:#e6f7e6;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">답: ${question.correct_answer ? '참' : '거짓'}</p>
      </div>
      ${question.explanation ? `
      <div style="background-color:#e6f0ff;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">해설:</p>
        <p>${question.explanation}</p>
      </div>
      ` : ''}
    </div>
  `;
}

const renderFillInTheBlankHTML = (question: Question, index: number): string => {
  const options = question.blanks && question.blanks[0]?.options?.map(option => 
    `<p style="margin-left:20px;margin-bottom:5px;">${option.id}. ${option.text}</p>`
  ).join('') || '';
  
  return `
    <div style="margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #eee;">
      <h3>문제 ${index + 1}: ${question.question_text}</h3>
      ${options ? `<div style="margin-top:10px;margin-bottom:10px;"><p style="font-weight:bold;">보기:</p>${options}</div>` : ''}
      <div style="background-color:#e6f7e6;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">답: ${question.blanks?.[0]?.correct_answer || ''}</p>
      </div>
      ${question.explanation ? `
      <div style="background-color:#e6f0ff;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">해설:</p>
        <p>${question.explanation}</p>
      </div>
      ` : ''}
    </div>
  `;
}

const renderShortAnswerHTML = (question: Question, index: number): string => {
  return `
    <div style="margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #eee;">
      <h3>문제 ${index + 1}: ${question.question_text}</h3>
      <div style="background-color:#e6f7e6;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">답: ${question.correct_answer}</p>
        ${question.alternative_answers && question.alternative_answers.length > 0 ? 
          `<p style="margin-top:5px;">대체답안: ${question.alternative_answers.join(', ')}</p>` : ''}
      </div>
      ${question.explanation ? `
      <div style="background-color:#e6f0ff;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">해설:</p>
        <p>${question.explanation}</p>
      </div>
      ` : ''}
    </div>
  `;
}

const renderDescriptiveHTML = (question: Question, index: number): string => {
  const keywords = question.answer_keywords?.map(keyword => 
    `<span style="display:inline-block;background-color:#e6e6ff;padding:3px 8px;margin:2px;border-radius:10px;">${keyword}</span>`
  ).join(' ') || '';

  return `
    <div style="margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #eee;">
      <h3>문제 ${index + 1}: ${question.question_text}</h3>
      ${keywords ? `
      <div style="margin-top:10px;margin-bottom:10px;">
        <p style="font-weight:bold;">채점 키워드:</p>
        <div style="margin-top:5px;">${keywords}</div>
      </div>
      ` : ''}
      <div style="background-color:#e6f7e6;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">모범답안:</p>
        <p>${question.model_answer || ''}</p>
      </div>
      ${question.explanation ? `
      <div style="background-color:#e6f0ff;padding:10px;margin-top:10px;border-radius:5px;">
        <p style="font-weight:bold;">해설:</p>
        <p>${question.explanation}</p>
      </div>
      ` : ''}
    </div>
  `;
}

// 문제 유형별 HTML 렌더링 결정 함수
const renderQuestionHTML = (question: Question, index: number): string => {
  // n지 선다형
  if (question.options && question.correct_answer && typeof question.correct_answer === 'string') {
    return renderMultipleChoiceHTML(question, index);
  }
  // 순서 배열형
  if (question.items && question.correct_sequence) {
    return renderSequenceHTML(question, index);
  }
  // 참거짓형
  if (typeof question.correct_answer === 'boolean') {
    return renderTrueFalseHTML(question, index);
  }
  // 빈칸 채우기형
  if (question.blanks) {
    return renderFillInTheBlankHTML(question, index);
  }
  // 서술형
  if (question.answer_keywords || question.model_answer) {
    return renderDescriptiveHTML(question, index);
  }
  // 단답형 (기본)
  return renderShortAnswerHTML(question, index);
}

// JSON 문제를 HTML로 파싱하는 함수
const parseQuestionsToHTML = (jsonText: string): string => {
  try {
    const data = JSON.parse(jsonText);
    
    // 단일 문제 객체인 경우 (questions 배열이 없는 경우)
    if (!data.questions && data.question_text) {
      return renderQuestionHTML(data, 0);
    }
    
    const questions = data.questions || [];
    
    if (questions.length === 0) {
      return `<p>문제가 없습니다.</p>`;
    }
    
    return questions.map((question: Question, index: number) => renderQuestionHTML(question, index)).join('');
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    return `<p>문제 형식 오류: 올바른 JSON 형식이 아닙니다.</p><pre>${jsonText}</pre>`;
  }
}

/**
 * PDF로 다운로드하는 함수
 * html2canvas를 사용하여 모든 텍스트를 이미지로 변환
 */
export const downloadAsPDF = async (
  content: string, 
  fileName: string, 
  type: string
): Promise<void> => {
  try {
    // PDF 생성 기본 설정
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    // PDF 페이지 크기
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // 여백 설정 - 가독성 향상을 위해 여백 증가
    const margin = {
      top: 70,     // 상단 여백 증가
      right: 50,
      bottom: 70,  // 하단 여백 증가
      left: 50
    };
    
    // html2canvas 임포트
    const html2canvas = (await import('html2canvas')).default;
    
    // 헤더 이미지 생성 함수
    const createHeaderImage = async (title: string) => {
      const headerDiv = document.createElement('div');
      headerDiv.style.width = `${pageWidth - margin.left - margin.right}px`;
      headerDiv.style.fontFamily = 'Arial, sans-serif';
      headerDiv.style.fontSize = '14px';
      headerDiv.style.fontWeight = 'bold';
      headerDiv.style.color = 'rgb(50, 50, 120)';
      headerDiv.style.position = 'relative';
      headerDiv.textContent = title;
      
      const headerLine = document.createElement('div');
      headerLine.style.position = 'absolute';
      headerLine.style.left = '0';
      headerLine.style.top = '25px';
      headerLine.style.width = '100%';
      headerLine.style.height = '1px';
      headerLine.style.backgroundColor = 'rgb(50, 50, 120)';
      
      headerDiv.appendChild(headerLine);
      
      document.body.appendChild(headerDiv);
      
      const canvas = await html2canvas(headerDiv, {
        scale: 2,
        logging: false,
        backgroundColor: null,
        useCORS: true
      });
      
      document.body.removeChild(headerDiv);
      
      return canvas;
    };
    
    // 푸터 이미지 생성 함수
    const createFooterImage = async (pageNum: number) => {
      const footerDiv = document.createElement('div');
      footerDiv.style.width = `${pageWidth - margin.left - margin.right}px`;
      footerDiv.style.fontFamily = 'Arial, sans-serif';
      footerDiv.style.fontSize = '10px';
      footerDiv.style.color = 'rgb(100, 100, 100)';
      footerDiv.style.textAlign = 'center';
      footerDiv.textContent = `${pageNum}`; 
      
      document.body.appendChild(footerDiv);
      
      const canvas = await html2canvas(footerDiv, {
        scale: 2,
        logging: false,
        backgroundColor: null,
        useCORS: true
      });
      
      document.body.removeChild(footerDiv);
      
      return canvas;
    };
    
    // 헤더 추가 함수
    const addHeader = async (title: string) => {
      const headerCanvas = await createHeaderImage(title);
      const headerImgWidth = pageWidth - margin.left - margin.right;
      const headerImgHeight = headerCanvas.height * headerImgWidth / headerCanvas.width;
      
      pdf.addImage(
        headerCanvas,
        'PNG',
        margin.left,
        margin.top - 40,
        headerImgWidth,
        headerImgHeight
      );
    };
    
    // 푸터 추가 함수
    const addFooter = async (pageNum: number) => {
      const footerCanvas = await createFooterImage(pageNum);
      const footerImgWidth = pageWidth - margin.left - margin.right;
      const footerImgHeight = footerCanvas.height * footerImgWidth / footerCanvas.width;
      
      pdf.addImage(
        footerCanvas,
        'PNG',
        margin.left,
        pageHeight - margin.bottom + 20,
        footerImgWidth,
        footerImgHeight
      );
    };
    
    // 문제 데이터 준비
    let contentData;
    
    // 문제 타입인 경우 JSON 파싱
    if (type.includes('문제') || type.includes('선다형') || type.includes('채우기형') || 
        type.includes('순서') || type.includes('참거짓') || type.includes('답형')) {
      try {
        contentData = JSON.parse(content);
      } catch (error) {
        console.error('JSON 파싱 실패:', error);
        contentData = { text: content };
      }
    } else {
      // 일반 텍스트 처리
      contentData = { text: content };
    }
    
    // 파일명에서 특수문자 제거 및 길이 제한
    const safeFileName = (fileName || 'result')
      .replace(/[^\w\s가-힣]/g, '_')  // 영문, 숫자, 한글, 공백만 허용
      .substring(0, 30);              // 길이 제한
    
    // 타입에서 특수문자 제거 및 길이 제한  
    const safeType = (type || '')
      .replace(/[^\w\s가-힣]/g, '_')   // 영문, 숫자, 한글, 공백만 허용
      .substring(0, 20);              // 길이 제한
    
    // 첫 페이지 헤더 추가
    await addHeader(`${safeFileName} - ${safeType}`);
    let currentY = margin.top + 20;
    let pageNum = 1;
    
    // 첫 페이지 푸터 추가
    await addFooter(pageNum);
    
    // 한글 문제를 PDF에 렌더링하는 함수
    const renderKoreanQuestions = async () => {
      // 단일 문제 객체인 경우 처리
      if (contentData.question_text) {
        currentY = await renderKoreanQuestionToPDF(
          pdf, contentData, 0, currentY, margin, pageWidth, pageHeight,
          async () => {
            pageNum++;
            pdf.addPage();
            await addHeader(`${safeFileName} - ${safeType}`);
            await addFooter(pageNum);
            return margin.top + 20;
          }
        );
      } 
      // 문제 배열인 경우 처리
      else if (contentData.questions && Array.isArray(contentData.questions)) {
        const questions = contentData.questions || [];
        
        for (let i = 0; i < questions.length; i++) {
          currentY = await renderKoreanQuestionToPDF(
            pdf, questions[i], i, currentY, margin, pageWidth, pageHeight,
            async () => {
              pageNum++;
              pdf.addPage();
              await addHeader(`${safeFileName} - ${safeType}`);
              await addFooter(pageNum);
              return margin.top + 20;
            }
          );
        }
      }
      // 일반 텍스트인 경우 처리
      else if (contentData.text) {
        currentY = await renderKoreanTextToPDF(
          pdf, contentData.text, currentY, margin, pageWidth, pageHeight,
          async () => {
            pageNum++;
            pdf.addPage();
            await addHeader(`${safeFileName} - ${safeType}`);
            await addFooter(pageNum);
            return margin.top + 20;
          }
        );
      }
    };
    
    await renderKoreanQuestions();
    
    // PDF 저장
    const outputFileName = `${safeFileName}_${safeType}.pdf`;
    pdf.save(outputFileName);
    
  } catch (error) {
    console.error('PDF 다운로드 중 오류:', error);
    throw new Error('PDF 다운로드 중 오류가 발생했습니다.');
  }
};

// 한글 텍스트를 PDF에 렌더링하는 함수 
const renderKoreanTextToPDF = async (
  pdf: jsPDF,
  text: string,
  startY: number,
  margin: {top: number, right: number, bottom: number, left: number},
  pageWidth: number,
  pageHeight: number,
  addNewPage: () => Promise<number>
): Promise<number> => {
  let currentY = startY;
  const textLines = text.split('\n');
  const contentWidth = pageWidth - margin.left - margin.right;
  
  // html2canvas로 한글 렌더링
  const html2canvas = (await import('html2canvas')).default;
  
  for (const line of textLines) {
    if (!line.trim()) {
      currentY += 15; // 빈 줄 처리
      continue;
    }
    
    // 각 라인을 이미지로 렌더링
    const tempDiv = document.createElement('div');
    tempDiv.style.width = `${contentWidth}px`;
    tempDiv.style.fontFamily = 'Arial, sans-serif'; // 폰트 설정 변경
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.5';
    tempDiv.style.color = '#000000';
    tempDiv.style.whiteSpace = 'normal';
    tempDiv.style.wordBreak = 'break-word';
    tempDiv.textContent = line;
    
    document.body.appendChild(tempDiv);
    
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      logging: false,
      backgroundColor: null,
      useCORS: true
    });
    
    document.body.removeChild(tempDiv);
    
    const imgHeight = canvas.height * contentWidth / canvas.width;
    
    // 페이지 넘김 체크
    if (currentY + imgHeight > pageHeight - margin.bottom) {
      currentY = await addNewPage();
    }
    
    // 이미지 PDF에 추가
    pdf.addImage(
      canvas,
      'PNG',
      margin.left,
      currentY,
      contentWidth,
      imgHeight
    );
    
    currentY += imgHeight + 5;
  }
  
  return currentY;
};

// 한글 문제를 PDF에 렌더링하는 함수
const renderKoreanQuestionToPDF = async (
  pdf: jsPDF,
  question: Question,
  index: number,
  startY: number,
  margin: {top: number, right: number, bottom: number, left: number},
  pageWidth: number,
  pageHeight: number,
  addNewPage: () => Promise<number>
): Promise<number> => {
  const html2canvas = (await import('html2canvas')).default;
  let currentY = startY;
  const contentWidth = pageWidth - margin.left - margin.right;
  
  // 문제 번호와 텍스트 렌더링
  const questionTitle = document.createElement('div');
  questionTitle.style.width = `${contentWidth}px`;
  questionTitle.style.fontFamily = 'Arial, sans-serif'; // 웹 안전 폰트 사용
  questionTitle.style.fontSize = '14px';
  questionTitle.style.fontWeight = 'bold';
  questionTitle.style.color = '#222222';
  questionTitle.style.marginBottom = '10px';
  questionTitle.textContent = `문제 ${index + 1}: ${question.question_text}`;
  
  document.body.appendChild(questionTitle);
  
  const titleCanvas = await html2canvas(questionTitle, {
    scale: 2,
    logging: false,
    backgroundColor: null,
    useCORS: true
  });
  
  document.body.removeChild(questionTitle);
  
  const titleHeight = titleCanvas.height * contentWidth / titleCanvas.width;
  
  // 페이지 넘김 체크
  if (currentY + titleHeight > pageHeight - margin.bottom) {
    currentY = await addNewPage();
  }
  
  // 제목 이미지 추가
  pdf.addImage(
    titleCanvas,
    'PNG',
    margin.left,
    currentY,
    contentWidth,
    titleHeight
  );
  
  currentY += titleHeight + 15;
  
  // n지 선다형 문제 처리
  if (question.options && question.correct_answer && typeof question.correct_answer === 'string') {
    // 보기 라벨
    const optionsLabel = document.createElement('div');
    optionsLabel.style.width = `${contentWidth}px`;
    optionsLabel.style.fontFamily = 'Arial, sans-serif';
    optionsLabel.style.fontSize = '12px';
    optionsLabel.style.fontWeight = 'bold';
    optionsLabel.textContent = '보기:';
    
    document.body.appendChild(optionsLabel);
    
    const labelCanvas = await html2canvas(optionsLabel, {
      scale: 2,
      logging: false,
      backgroundColor: null,
      useCORS: true
    });
    
    document.body.removeChild(optionsLabel);
    
    const labelHeight = labelCanvas.height * contentWidth / labelCanvas.width;
    
    // 페이지 넘김 체크
    if (currentY + labelHeight > pageHeight - margin.bottom) {
      currentY = await addNewPage();
    }
    
    // 라벨 이미지 추가
    pdf.addImage(
      labelCanvas,
      'PNG',
      margin.left,
      currentY,
      contentWidth,
      labelHeight
    );
    
    currentY += labelHeight + 10;
    
    // 각 선택지 렌더링
    for (const option of question.options || []) {
      const optionDiv = document.createElement('div');
      optionDiv.style.width = `${contentWidth - 30}px`;
      optionDiv.style.fontFamily = 'Arial, sans-serif';
      optionDiv.style.fontSize = '12px';
      optionDiv.style.marginLeft = '20px';
      optionDiv.textContent = `${option.id}. ${option.text}`;
      
      document.body.appendChild(optionDiv);
      
      const optionCanvas = await html2canvas(optionDiv, {
        scale: 2,
        logging: false,
        backgroundColor: null,
        useCORS: true
      });
      
      document.body.removeChild(optionDiv);
      
      const optionHeight = optionCanvas.height * (contentWidth - 30) / optionCanvas.width;
      
      // 페이지 넘김 체크
      if (currentY + optionHeight > pageHeight - margin.bottom) {
        currentY = await addNewPage();
      }
      
      // 선택지 이미지 추가
      pdf.addImage(
        optionCanvas,
        'PNG',
        margin.left + 20,
        currentY,
        contentWidth - 30,
        optionHeight
      );
      
      currentY += optionHeight + 5;
    }
    
    // 정답 렌더링 (배경색 있는 블록)
    currentY = await renderAnswerBlock(pdf, `답: ${question.correct_answer}`, currentY, margin, pageWidth, pageHeight, addNewPage);
    
    // 해설 렌더링 (배경색 있는 블록)
    if (question.explanation) {
      currentY = await renderExplanationBlock(pdf, question.explanation, currentY, margin, pageWidth, pageHeight, addNewPage);
    }
  }
  // 다른 문제 유형들도 비슷한 방식으로 처리
  else if (question.items && question.correct_sequence) {
    // 순서 배열형 문제 처리
    // ...유사한 렌더링 로직...
    const itemsLabel = document.createElement('div');
    itemsLabel.style.width = `${contentWidth}px`;
    itemsLabel.style.fontFamily = 'Arial, sans-serif';
    itemsLabel.style.fontSize = '12px';
    itemsLabel.style.fontWeight = 'bold';
    itemsLabel.textContent = '선택지:';
    
    document.body.appendChild(itemsLabel);
    
    const labelCanvas = await html2canvas(itemsLabel, {
      scale: 2,
      logging: false,
      backgroundColor: null,
      useCORS: true
    });
    
    document.body.removeChild(itemsLabel);
    
    const labelHeight = labelCanvas.height * contentWidth / labelCanvas.width;
    
    // 페이지 넘김 체크
    if (currentY + labelHeight > pageHeight - margin.bottom) {
      currentY = await addNewPage();
    }
    
    // 라벨 이미지 추가
    pdf.addImage(
      labelCanvas,
      'PNG',
      margin.left,
      currentY,
      contentWidth,
      labelHeight
    );
    
    currentY += labelHeight + 10;
    
    // 각 항목 렌더링
    for (const item of question.items || []) {
      const itemDiv = document.createElement('div');
      itemDiv.style.width = `${contentWidth - 30}px`;
      itemDiv.style.fontFamily = 'Arial, sans-serif';
      itemDiv.style.fontSize = '12px';
      itemDiv.style.marginLeft = '20px';
      itemDiv.textContent = `${item.id}. ${item.text}`;
      
      document.body.appendChild(itemDiv);
      
      const itemCanvas = await html2canvas(itemDiv, {
        scale: 2,
        logging: false,
        backgroundColor: null,
        useCORS: true
      });
      
      document.body.removeChild(itemDiv);
      
      const itemHeight = itemCanvas.height * (contentWidth - 30) / itemCanvas.width;
      
      // 페이지 넘김 체크
      if (currentY + itemHeight > pageHeight - margin.bottom) {
        currentY = await addNewPage();
      }
      
      // 항목 이미지 추가
      pdf.addImage(
        itemCanvas,
        'PNG',
        margin.left + 20,
        currentY,
        contentWidth - 30,
        itemHeight
      );
      
      currentY += itemHeight + 5;
    }
    
    // 정답 렌더링
    currentY = await renderAnswerBlock(pdf, `정답 순서: ${question.correct_sequence.join(' → ')}`, currentY, margin, pageWidth, pageHeight, addNewPage);
    
    if (question.explanation) {
      currentY = await renderExplanationBlock(pdf, question.explanation, currentY, margin, pageWidth, pageHeight, addNewPage);
    }
  }
  else if (typeof question.correct_answer === 'boolean') {
    // 참거짓형 문제 처리
    const optionsLabel = document.createElement('div');
    optionsLabel.style.width = `${contentWidth}px`;
    optionsLabel.style.fontFamily = 'Arial, sans-serif';
    optionsLabel.style.fontSize = '12px';
    optionsLabel.style.fontWeight = 'bold';
    optionsLabel.textContent = '보기: 참 / 거짓';
    
    document.body.appendChild(optionsLabel);
    
    const labelCanvas = await html2canvas(optionsLabel, {
      scale: 2,
      logging: false,
      backgroundColor: null,
      useCORS: true
    });
    
    document.body.removeChild(optionsLabel);
    
    const labelHeight = labelCanvas.height * contentWidth / labelCanvas.width;
    
    // 페이지 넘김 체크
    if (currentY + labelHeight > pageHeight - margin.bottom) {
      currentY = await addNewPage();
    }
    
    // 라벨 이미지 추가
    pdf.addImage(
      labelCanvas,
      'PNG',
      margin.left,
      currentY,
      contentWidth,
      labelHeight
    );
    
    currentY += labelHeight + 10;
    
    // 정답 렌더링
    currentY = await renderAnswerBlock(pdf, `답: ${question.correct_answer ? '참' : '거짓'}`, currentY, margin, pageWidth, pageHeight, addNewPage);
    
    if (question.explanation) {
      currentY = await renderExplanationBlock(pdf, question.explanation, currentY, margin, pageWidth, pageHeight, addNewPage);
    }
  }
  // 기타 문제 유형들도 유사한 방식으로 구현...
  else {
    // 단답형 문제 (기본 케이스)
    currentY = await renderAnswerBlock(pdf, `답: ${question.correct_answer || ''}`, currentY, margin, pageWidth, pageHeight, addNewPage);
    
    if (question.explanation) {
      currentY = await renderExplanationBlock(pdf, question.explanation, currentY, margin, pageWidth, pageHeight, addNewPage);
    }
  }
  
  // 문제 구분선 추가
  if (currentY + 20 > pageHeight - margin.bottom) {
    currentY = await addNewPage();
  } else {
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.line(margin.left, currentY + 10, pageWidth - margin.right, currentY + 10);
    currentY += 25; // 다음 문제를 위한 여백
  }
  
  return currentY;
};

// 정답 블록 렌더링 함수
const renderAnswerBlock = async (
  pdf: jsPDF,
  answerText: string,
  startY: number,
  margin: {top: number, right: number, bottom: number, left: number},
  pageWidth: number,
  pageHeight: number,
  addNewPage: () => Promise<number>
): Promise<number> => {
  const html2canvas = (await import('html2canvas')).default;
  const contentWidth = pageWidth - margin.left - margin.right;
  
  // 정답 블록 생성
  const answerBlock = document.createElement('div');
  answerBlock.style.width = `${contentWidth - 20}px`;
  answerBlock.style.backgroundColor = '#e6f7e6';
  answerBlock.style.padding = '10px';
  answerBlock.style.borderRadius = '5px';
  answerBlock.style.fontFamily = 'Arial, sans-serif';
  answerBlock.style.fontSize = '12px';
  answerBlock.style.fontWeight = 'bold';
  answerBlock.style.color = '#004d00';
  answerBlock.textContent = answerText;
  
  document.body.appendChild(answerBlock);
  
  const answerCanvas = await html2canvas(answerBlock, {
    scale: 2,
    logging: false,
    backgroundColor: null,
    useCORS: true
  });
  
  document.body.removeChild(answerBlock);
  
  const answerHeight = answerCanvas.height * (contentWidth - 20) / answerCanvas.width;
  
  // 페이지 넘김 체크
  if (startY + answerHeight > pageHeight - margin.bottom) {
    startY = await addNewPage();
  }
  
  // 이미지 추가
  pdf.addImage(
    answerCanvas,
    'PNG',
    margin.left + 10,
    startY,
    contentWidth - 20,
    answerHeight
  );
  
  return startY + answerHeight + 15;
};

// 해설 블록 렌더링 함수
const renderExplanationBlock = async (
  pdf: jsPDF,
  explanationText: string,
  startY: number,
  margin: {top: number, right: number, bottom: number, left: number},
  pageWidth: number,
  pageHeight: number,
  addNewPage: () => Promise<number>
): Promise<number> => {
  const html2canvas = (await import('html2canvas')).default;
  const contentWidth = pageWidth - margin.left - margin.right;
  
  // 해설 블록 생성
  const explanationBlock = document.createElement('div');
  explanationBlock.style.width = `${contentWidth - 20}px`;
  explanationBlock.style.backgroundColor = '#e6f0ff';
  explanationBlock.style.padding = '10px';
  explanationBlock.style.borderRadius = '5px';
  explanationBlock.style.fontFamily = 'Arial, sans-serif';
  
  const explanationTitle = document.createElement('p');
  explanationTitle.style.fontSize = '12px';
  explanationTitle.style.fontWeight = 'bold';
  explanationTitle.style.marginTop = '0';
  explanationTitle.style.marginBottom = '5px';
  explanationTitle.style.color = '#000066';
  explanationTitle.textContent = '해설:';
  
  const explanationContent = document.createElement('p');
  explanationContent.style.fontSize = '12px';
  explanationContent.style.margin = '0';
  explanationContent.style.wordBreak = 'break-word';
  explanationContent.style.lineHeight = '1.4';
  explanationContent.textContent = explanationText;
  
  explanationBlock.appendChild(explanationTitle);
  explanationBlock.appendChild(explanationContent);
  
  document.body.appendChild(explanationBlock);
  
  const explanationCanvas = await html2canvas(explanationBlock, {
    scale: 2,
    logging: false,
    backgroundColor: null,
    useCORS: true
  });
  
  document.body.removeChild(explanationBlock);
  
  const explanationHeight = explanationCanvas.height * (contentWidth - 20) / explanationCanvas.width;
  
  // 페이지 넘김 체크
  if (startY + explanationHeight > pageHeight - margin.bottom) {
    startY = await addNewPage();
  }
  
  // 이미지 추가
  pdf.addImage(
    explanationCanvas,
    'PNG',
    margin.left + 10,
    startY,
    contentWidth - 20,
    explanationHeight
  );
  
  return startY + explanationHeight + 15;
};