import { jsPDF } from 'jspdf'
import { Question } from '../types/upload'

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

export const downloadAsPDF = async (
  content: string, 
  fileName: string, 
  type: string
): Promise<void> => {
  try {
    // 임시 HTML 요소 생성
    const tempDiv = document.createElement('div')
    tempDiv.style.padding = '40px'
    tempDiv.style.width = '595px'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.fontSize = '12px'
    tempDiv.style.lineHeight = '1.5'
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.backgroundColor = 'white'
    
    // 내용 준비
    let htmlContent = '';
    
    // 문제 타입인 경우 JSON 파싱 시도
    if (type.includes('문제') || type.includes('선다형') || type.includes('채우기형') || 
        type.includes('순서') || type.includes('참거짓') || type.includes('답형')) {
      try {
        htmlContent = parseQuestionsToHTML(content);
      } catch (error) {
        console.error('JSON 파싱 실패:', error);
        // JSON 파싱 실패 시 일반 텍스트로 표시
        htmlContent = content
          .split('\n')
          .map(line => `<p style="margin-bottom: 8px;">${line}</p>`)
          .join('');
      }
    } else {
      // 요약본 등 일반 텍스트 처리
      htmlContent = content
        .split('\n')
        .map(line => `<p style="margin-bottom: 8px;">${line}</p>`)
        .join('');
    }
    
    tempDiv.innerHTML = `
      <h2 style="margin-bottom: 20px;">${fileName || 'result'} - ${type}</h2>
      ${htmlContent}
    `
    document.body.appendChild(tempDiv)
    
    // html2canvas로 HTML을 이미지로 변환 (동적 import)
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: 'white'
    })
    
    // 이미지를 PDF로 변환
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    })
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const ratio = pdfWidth / canvas.width
    const imgHeight = canvas.height * ratio
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight)
    
    // 페이지가 A4 크기를 초과하는 경우 여러 페이지로 나누기
    if (imgHeight > pdf.internal.pageSize.getHeight()) {
      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;
      
      // 첫 페이지는 이미 추가됨
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft > 0) {
        position = position - pdf.internal.pageSize.getHeight();
        pdf.addPage();
        page++;
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
    }
    
    // 임시 요소 제거
    document.body.removeChild(tempDiv)
    
    // PDF 저장
    const outputFileName = `${fileName || 'result'}_${type}.pdf`
    pdf.save(outputFileName)
    
  } catch (error) {
    console.error('PDF 다운로드 중 오류:', error)
    throw new Error('PDF 다운로드 중 오류가 발생했습니다.')
  }
}
