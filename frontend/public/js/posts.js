import { formatKoreanTime } from '../utils/timeUtils.js';

// 전역 상태 관리 변수들
const threadContainer = document.getElementById('threadContainer');
let currentPage = 1; // 현재 페이지 번호
const postsPerPage = 10; // 페이지당 게시글 수
let isLoading = false; // 데이터 로딩 중 여부
let hasMorePosts = true; // 추가 게시글 존재 여부

/**
 * 게시글 목록을 서버에서 가져오는 함수
 * @param {number} page - 요청할 페이지 번호
 */
async function fetchPosts(page = 1) {
    // 로딩 중이거나 더 이상 게시글이 없으면 중단
    if (isLoading || !hasMorePosts) return;

    try {
        isLoading = true;
        const response = await fetch(
            //`http://localhost:3000/posts?page=${page}&limit=${postsPerPage}`,
            `http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/posts?page=${page}&limit=${postsPerPage}`,
        );

        if (!response.ok) {
            throw new Error('게시글을 가져오는 데 실패했습니다.');
        }

        const data = await response.json();
        displayPosts(data.posts); // 게시글 화면에 표시
        currentPage = data.currentPage; // 현재 페이지 업데이트
        hasMorePosts = currentPage < data.totalPages; // 추가 페이지 존재 여부 확인
    } catch (error) {
        console.error('Posts fetch error:', error);
        alert(error.message);
    } finally {
        isLoading = false;
    }
}

/**
 * 게시글들을 화면에 표시하는 함수
 * @param {Array} posts - 표시할 게시글 배열
 */
function displayPosts(posts) {
    posts.forEach(post => {
        // 게시글 카드 요소 생성
        const postCard = document.createElement('div');
        postCard.classList.add('post-card');
        postCard.dataset.id = post.id;

        // 시간 형식 변환 (예: "n분 전", "n시간 전" 등)
        const koreanTime = formatKoreanTime(post.created_at);

        // 게시글 카드 내용 구성
        postCard.innerHTML = `
            <div class="post-header">
                <h2 class="post-title">${post.title}</h2>
                <div class="post-info">
                    <span class="post-author"> 작성자: ${post.nickname}</span>
                    <span class="post-date">${koreanTime}</span>
                </div>
            </div>
            <div class="post-divider"></div>
            <div class="post-footer">
                <span class="post-stats">
                    조회수: ${post.views || 0}
                    댓글:  ${post.comments_count || 0}
                    좋아요: ${post.like_count || 0}
                </span>
            </div>
        `;

        // 게시글 클릭 시 상세 페이지로 이동
        postCard.addEventListener('click', () => {
            window.location.href = `post-detail.html?id=${post.id}`;
        });

        threadContainer.appendChild(postCard);
    });
}

/**
 * 무한 스크롤 처리 함수
 * 페이지 하단에 도달하면 추가 게시��� 로드
 */
function handleScroll() {
    if (
        window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 200 &&
        !isLoading &&
        hasMorePosts
    ) {
        currentPage++;
        fetchPosts(currentPage);
    }
}

/**
 * 사용자 로그인 상태 확인 함수
 * 로그인 상태에 따라 게시글 작성 버튼 표시/숨김
 */
function checkAuth() {
    const email = localStorage.getItem('email');
    const createButton = document.querySelector('.create-button');

    if (createButton) {
        createButton.style.display = email ? 'block' : 'none';
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts(currentPage); // 초기 게시글 로드
    window.addEventListener('scroll', handleScroll); // 무한 스크롤 이벤트 설정

    // 게시글 작성 버튼 이벤트 설정
    const createButton = document.querySelector('.create-button');
    if (createButton) {
        createButton.addEventListener('click', () => {
            window.location.href = 'create-post.html';
        });
    }

    checkAuth(); // 인증 상태 확인
});