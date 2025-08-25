# 게임사 로고 이미지 폴더

이 폴더에는 게임사 로고 이미지 파일들이 저장됩니다.

## 권장 이미지 규격
- **크기**: 120x72px (60x36px로 표시됨)
- **형식**: PNG (투명 배경 권장)
- **파일명**: 소문자-하이픈 형식 (예: pragmatic-play.png)

## 현재 지원되는 게임사
- pragmatic-play.png - Pragmatic Play
- netent.png - NetEnt
- microgaming.png - Microgaming
- playngo.png - Play'n GO
- red-tiger.png - Red Tiger
- big-time-gaming.png - Big Time Gaming
- push-gaming.png - Push Gaming
- nolimit-city.png - Nolimit City
- hacksaw-gaming.png - Hacksaw Gaming
- elk-studios.png - ELK Studios
- default-logo.png - 기본 로고

## 사용법
1. 위 파일명으로 로고 이미지를 이 폴더에 저장
2. 이미지가 없는 경우 자동으로 색상 기반 fallback 표시
3. 새로운 게임사 추가 시 SlotSettingData.jsx의 logoMap에 추가