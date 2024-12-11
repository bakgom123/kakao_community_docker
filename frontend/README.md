# 2-david-yoo-community-fe

# 커뮤니티 게시판 프로젝트 Frontend

## 프로젝트 소개
순수 JavaScript와 HTML/CSS를 사용하여 구현한 커뮤니티 게시판입니다. 사용자 인증, 게시글 CRUD, 댓글, 좋아요 등 커뮤니티의 기본적인 기능들을 제공합니다.

## 기술 스택

<div style="display:flex;gap:30px;flex-wrap:wrap;">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white"/>
</div>

- HTML5
- CSS3
- JavaScript (ES6+)

## 주요 기능
- **사용자 인증**
  - 회원가입 / 로그인
  - 프로필 이미지 업로드
  - 닉네임 설정
  - 비밀번호 변경
  - 회원 탈퇴

- **게시글**
  - 게시글 작성/수정/삭제
  - 이미지 업로드
  - 조회수 확인
  - 무한 스크롤 페이징

- **댓글**
  - 댓글 작성/수정/삭제
  - 작성 시간 표시
  - 수정 여부 표시

- **좋아요**
  - 게시글 좋아요/취소
  - 좋아요 수 표시


## JavaScript 파일 설명
- `login.js`: 로그인 처리
- `signup.js`: 회원가입 처리
- `posts.js`: 게시글 목록 표시
- `post-detail.js`: 게시글 상세 페이지
- `create-post.js`: 게시글 작성
- `edit-post.js`: 게시글 수정
- `edit-profile.js`: 프로필 수정
- `change-password.js`: 비밀번호 변경

## 시작하기
1. 저장소 클론
```bash
git clone https://github.com/100-hours-a-week/2-david-yoo-community-fe.git
```

2. 서버 실행 (예: Live Server)

## 주의사항
- 이 프로젝트는 학습 목적으로 제작되었으며, 실제 프로덕션 환경에서는 추가적인 보안 조치가 필요할 수 있습니다.