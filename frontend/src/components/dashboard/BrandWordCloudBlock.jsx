import React from 'react';
import ReactWordcloud from 'react-wordcloud';

const BrandWordCloudBlock = ({ wordData = null }) => {

    if (!wordData || wordData.length === 0) {
        return (
            <div className="flex-1 w-full flex flex-col items-center justify-center text-gray-400 italic text-xs">
                데이터가 없습니다.
            </div>
        );
    }

    // 2. 워드클라우드 옵션 설정
    const options = {
        // 1. 글꼴 및 스타일
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
        fontWeight: '700', // 글자를 굵게 해서 강조
        
        // 2. 크기 및 배치
        fontSizes: [18, 72],    // 최소 크기를 조금 키워서 가독성 확보
        padding: 3,             // 단어 사이의 여백을 좁게 해서 밀도감 있게 (힙한 느낌)
        rotations: 2,           // 가끔 세로 단어를 섞어주면 더 역동적입니다. (완전 가로만 원하면 1)
        rotationAngles: [0, 0], // 0도(가로)와 90도(세로) 중 선택하게 하려면 [0, 90]
        
        // 3. 알고리즘 (핵심!)
        deterministic: true,    // 새로고침해도 모양이 변하지 않음
        spiral: 'archimedean',  // 단어를 중앙부터 촘촘하게 배치 ('rectangular'보다 예쁨)
        scale: 'sqrt',          // 빈도수 차이가 클 때 너무 작게 나오는 걸 방지 (제곱근 스케일)
        
        // 4. 기타
        enableTooltip: true,    // 마우스 올렸을 때 툴팁 활성화
        transitionDuration: 1000, // 처음에 단어가 나타날 때 애니메이션 시간 (ms)
    };
    // 3. 색상 로직 (감성에 따른 색상 구분)
    const callbacks = {
        getWordColor: (word) => {
            if (word.polarity === 'POS') return '#3B82F6'; // 긍정: 파랑
            if (word.polarity === 'NEG') return '#EF4444'; // 부정: 빨강
            return '#94A3B8'; // 중립: 회색
        },
        getWordTooltip: (word) => `${word.text}: ${word.value}회`,
    };
    console.log(wordData);
    return (

        <div className="flex-1 w-full flex flex-col h-full">
            <h3 className="text-sm font-bold text-gray-700 self-start mb-4">워드 클라우드</h3>
            
            <div className="flex-1 w-full min-h-[300px]">
                <ReactWordcloud 
                    words={wordData.wordCloudRow} 
                    options={options} 
                    callbacks={callbacks} 
                />
            </div>

            <div className="mt-auto w-full border-t pt-2 text-[10px] text-gray-300 text-right uppercase tracking-widest">
                Wordcloud Block
            </div>
        </div>
    );
};

export default BrandWordCloudBlock; 