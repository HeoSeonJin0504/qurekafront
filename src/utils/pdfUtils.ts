import { jsPDF } from 'jspdf'

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
    const htmlContent = content
      .split('\n')
      .map(line => `<p style="margin-bottom: 8px;">${line}</p>`)
      .join('')
    
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
