import { formatKoreanTime } from '../utils/timeUtils.js';

const CLOUDFRONT_DOMAIN = 'd2t2xvt037aek.cloudfront.net';
/**
 * 사용자 프로필 정보를 가져오는 함수
 * @param {string} email - 사용자 이메일
 * @returns {Object} 프로필 이미지 정보
 */
async function fetchUserProfile(email) {
    try {
        const response = await fetch(`http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/user/profile-image/${email}`, {
           headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
           },
       });
        if (!response.ok) {
            throw new Error('프로필 가져오기 실패');
        }

        const data = await response.json();
        // 기본 프로필 이미지 처리
        if (!data.profileImage || data.profileImage === 'default.webp') {
            return {
                profileImage: 'default.webp',
                // imageUrl: 'http://localhost:3000/uploads/profiles/default.webp',
                imageUrl: `https://${CLOUDFRONT_DOMAIN}/uploads/profiles/default.webp`,
            };
        }

        return {
            profileImage: data.profileImage,
            // imageUrl: `http://localhost:3000/uploads/profiles/${data.profileImage}`,
            imageUrl: `https://${CLOUDFRONT_DOMAIN}/uploads/profiles/${data.profileImage}`,
        };
    } catch (error) {
        console.error('프로필 가져오기 오류:', error);
        return {
            profileImage: 'default.webp',
            // imageUrl: 'http://localhost:3000/uploads/profiles/default.webp',
            imageUrl: `https://${CLOUDFRONT_DOMAIN}/uploads/profiles/default.webp`,
        };
    }
}

// 좋아요 관련 상태 관리
let isLiked = false; // 현재 사용자의 좋아요 상태
let currentPost = null; // 현재 게시글 정보

/**
 * 로컬 스토리지에서 좋아요 상태를 관리하는 함수들
 */
function getLikedPosts() {
    return JSON.parse(localStorage.getItem('likedPosts')) || {};
}

function saveLikedPosts(likedPosts) {
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
}

/**
 * 좋아요 상태를 로드하는 함수
 * @param {string} postId - 게시글 ID
 */
function loadLikeState(postId) {
    const likedPosts = getLikedPosts();
    isLiked = likedPosts[postId] === true;
    updateLikeDisplay();
}

/**
 * 좋아요 상태를 저장하는 함수
 * @param {string} postId - 게시글 ID
 */
async function saveLikeState(postId) {
    const likedPosts = getLikedPosts();
    if (isLiked) {
        likedPosts[postId] = true;
    } else {
        delete likedPosts[postId];
    }
    saveLikedPosts(likedPosts);
}

/**
 * 좋아요 토글 처리 함수
 * @param {string} postId - 게시글 ID
 */
async function toggleLike(postId) {
    const email = localStorage.getItem('email');
    if (!email) {
        alert('로그인이 필요한 기능입니다.');
        return;
    }

    try {
        // UI 즉시 업데이트
        isLiked = !isLiked;
        currentPost.like_count += isLiked ? 1 : -1;
        updateLikeDisplay();

        // 서버에 좋아요 상태 변경 요청
        const response = await fetch(
            // `http://localhost:3000/likes/${postId}`,
            `http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/likes/${postId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_liked: isLiked,
                    email: email,
                }),
            },
        );

        if (!response.ok) {
            throw new Error('좋아요 처리 실패');
        }

        // 서버 응답에 따른 상태 업데이트
        const result = await response.json();
        if (result.success) {
            currentPost.like_count = result.post_likes;
            isLiked = result.is_liked;
            await saveLikeState(postId);
            updateLikeDisplay();
        }
    } catch (error) {
        console.error('좋아요 처리 중 오류:', error);
        // 에러 발생 시 UI 상태 원복
        isLiked = !isLiked;
        currentPost.like_count += isLiked ? 1 : -1;
        updateLikeDisplay();
    }
}

/**
 * 좋아요 UI 업데이트 함수
 */
function updateLikeDisplay() {
    const likesCountElement = document.getElementById('likes-count');
    const likeButton = document.querySelector('.stat-item[data-type="likes"]');

    if (likesCountElement) {
        likesCountElement.textContent = formatLikeCount(currentPost.like_count);
    }

    if (likeButton) {
        if (isLiked) {
            likeButton.classList.add('liked');
            likeButton.style.backgroundColor = '#e9e9e9';
        } else {
            likeButton.classList.remove('liked');
            likeButton.style.backgroundColor = '';
        }
    }
}

/**
 * 페이지 로드 시 좋아요 상태 확인
 * @param {string} postId - 게시글 ID
 */
async function checkLikeStatus(postId) {
    const email = localStorage.getItem('email');
    if (!email) return;

    try {
        const response = await fetch(
            // `http://localhost:3000/likes/check/${postId}?email=${email}`,
            `http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/likes/check/${postId}?email=${email}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                isLiked = result.is_liked;
                currentPost.like_count = result.post_likes;
                await saveLikeState(postId);
                updateLikeDisplay();
            }
        }
    } catch (error) {
        console.error('좋아요 상태 확인 중 오류:', error);
    }
}

/**
 * 좋아요 수 포맷팅 함수
 * @param {number} count - 좋아요 수
 * @returns {string} 포맷팅된 좋아요 수
 */
function formatLikeCount(count) {
    if (count >= 10000) {
        return Math.floor(count / 1000) + 'k';
    } else if (count >= 1000) {
        return Math.floor(count / 100) / 10 + 'k';
    }
    return count.toString();
}

/**
 * 게시글 데이터를 가져오고 표시하는 함수
 * @param {string} postId - 게시글 ID
 */
async function fetchPost(postId) {
    try {
        // 조회수 증가 요청
        // await fetch(`http://localhost:3000/views/${postId}`, {
        await fetch(`http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/views/${postId}`, {
            method: 'POST',
        });

        // 게시글 데이터 요청
        // const response = await fetch(`http://localhost:3000/posts/${postId}`);
        const response = await fetch(`http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/posts/${postId}`);

        if (!response.ok) {
            throw new Error('게시글 가져오기 실패');
        }

        const data = await response.json();
        if (!data.success || !data.post) {
            throw new Error('잘못된 게시글 데이터');
        }

        // 작성자의 프로필 정보 가져오기 (닉네임 포함)
        // const profileResponse = await fetch(
        //     `http://localhost:3000/user/profile-image/${data.post.author_email}`,
        // );
        const profileResponse = await fetch(
            `http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/user/profile-image/${data.post.author_email}`
        );
        const profileData = await profileResponse.json();

        if (profileData.success && profileData.nickname) {
            data.post.nickname = profileData.nickname; // 최신 닉네임으로 업데이트
        }

        currentPost = data.post;
        await checkLikeStatus(postId);
        await displayPost(currentPost);

        // 작성자인 경우에만 수정/삭제 버튼 표시
        const currentUserEmail = localStorage.getItem('email');
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.style.display =
                currentUserEmail === currentPost.author_email ? 'flex' : 'none';
        }

        // 댓글 수 업데��트
        const commentsCount = document.getElementById('comments-count');
        if (commentsCount) {
            commentsCount.textContent = currentPost.comments_count || 0;
        }
    } catch (error) {
        console.error('게시글 가져오기 오류:', error);
        alert('게시글을 불러오는데 실패했습니다.');
    }
}

/**
 * 게시글 내용을 화면에 표시하는 함수
 * @param {Object} post - 게시글 데이터
 */
async function displayPost(post) {
    if (!post) return;

    // 작성자 프로필 정보 가져오기
    const profileData = await fetchUserProfile(post.author_email);

    const elements = {
        title: document.getElementById('post-title'),
        author: document.getElementById('author-name'),
        date: document.getElementById('post-date'),
        content: document.getElementById('content-text'),
        views: document.getElementById('views-count'),
        likes: document.getElementById('likes-count'),
        comments: document.getElementById('comments-count'),
        profileImage: document.querySelector('.profile-image'),
    };

    // 프로필 이미지 업데이트
    if (elements.profileImage && profileData) {
        elements.profileImage.innerHTML = `
            <img src="${profileData.imageUrl}" 
                 alt="${post.nickname}의 프로필"
                 style="width: 40px;height: 40px; border-radius: 50%;">
        `;
    }

    // 게시글 정보 표시
    if (elements.title) elements.title.textContent = post.title;
    if (elements.author) elements.author.textContent = post.nickname;
    if (elements.date && post.created_at) {
        elements.date.textContent = formatKoreanTime(post.created_at);
    }

    if (elements.content) elements.content.textContent = post.content;
    if (elements.views) elements.views.textContent = post.views || 0;
    if (elements.likes)
        elements.likes.textContent = formatLikeCount(post.like_count || 0);
    if (elements.comments)
        elements.comments.textContent = post.commentsCount || 0;

    // 게시글 이미지 표시
    const postImageContainer = document.querySelector('.post-image');
    if (postImageContainer && post.image) {
        postImageContainer.innerHTML = `
            <img src="https://${CLOUDFRONT_DOMAIN}/uploads/posts/${post.image}" 
                alt="게시글 이미지"
                style="max-width: 100%; max-height: 100%; ">
        `;
        postImageContainer.style.display = 'block';
    } else if (postImageContainer) {
        postImageContainer.style.display = 'none';
    }
}

/**
 * 게시글 삭제 처리 함수
 * @param {string} postId - 삭제할 게시글 ID
 */
async function handlePostDelete(postId) {
    try {
        // const response = await fetch(`http://localhost:3000/posts/${postId}`, {
        const response = await fetch(`http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/posts/${postId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('게시글 삭제 실패');
        }

        const result = await response.json();
        if (result.success) {
            alert('게시글이 삭제되었습니다.');
            window.location.href = 'posts.html';
        }
    } catch (error) {
        console.error('게시글 삭제 중 오류:', error);
        alert('게시글 삭제에 실패했습니다.');
    }
}

/**
 * 댓글 작성 처리 함수
 * @param {string} postId - 게시글 ID
 */
async function submitComment(postId) {
    const commentTextArea = document.querySelector('.comment-input textarea');
    const content = commentTextArea?.value.trim();
    const email = localStorage.getItem('email');
    const nickname = localStorage.getItem('nickname');

    // 로그인 상태 확인
    if (!email) {
        alert('로그인이 필요한 기능입니다.');
        return;
    }

    // 댓글 내용 확인
    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        // const response = await fetch('http://localhost:3000/comments', {
        const response = await fetch('http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                postId,
                content,
                author: nickname,
                author_email: email,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '댓글 작성 실패');
        }

        const data = await response.json();

        if (data.success) {
            // 입력 필드 초기화
            commentTextArea.value = '';

            // 새 댓글 표시
            await displayComment({
                id: data.comment.id,
                content: content,
                author_nickname: nickname,
                author_email: email,
                created_at: data.comment.created_at,
                lastModified: false,
            });

            // 댓글 수 업데이트
            const commentsCount = document.getElementById('comments-count');
            if (commentsCount) {
                commentsCount.textContent =
                    parseInt(commentsCount.textContent || 0) + 1;
            }
        }
    } catch (error) {
        console.error('댓글 작성 중 오류:', error);
        alert(error.message || '댓글 작성에 실패했습니다.');
    }
}

/**
 * 댓글 삭제 처리 함수
 * @param {string} commentId - 댓글 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
async function deleteComment(commentId) {
    try {
        // const response = await fetch(
        //     `http://localhost:3000/comments/${commentId}`,
        //     {
            const response = await fetch(`http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    author_email: localStorage.getItem('email'),
                }),
            },
        );

        if (!response.ok) {
            throw new Error('댓글 삭제 실패');
        }

        const data = await response.json();
        if (data.success) {
            // DOM에서 댓글 요소 제거
            const commentElement = document.querySelector(
                `[data-comment-id="${commentId}"]`,
            );
            if (commentElement) {
                commentElement.remove();
            }

            // 댓글 수 업데이트
            const commentsCount = document.getElementById('comments-count');
            if (commentsCount) {
                commentsCount.textContent = data.commentCount;
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('댓글 삭제 중 오류:', error);
        throw error;
    }
}

/**
 * 게시글의 총 댓글 수를 가져오는 함수
 * @param {string} postId - 댓글 수를 조회할 게시글의 ID
 * @returns {Promise<number>} 총 댓글 수 (에러 발생 시 0 반환)
 */
async function fetchCommentCount(postId) {
    try {
        // const response = await fetch(
        //     `http://localhost:3000/comments/${postId}`,
        // );
        const response = await fetch(`http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/comments/${postId}`);
        if (!response.ok) throw new Error('댓글 가져오기 실패');
        const comments = await response.json();
        return Array.isArray(comments) ? comments.length : 0;
    } catch (error) {
        console.error('댓글 수 가져오기 오류:', error);
        return 0;
    }
}

/**
 * 댓글 목록을 가져오고 표시하는 함수
 * @param {string} postId - 게시글 ID
 */
async function fetchComments(postId) {
    try {
        // const response = await fetch(
        //     `http://localhost:3000/comments/${postId}`,
        // );
        const response = await fetch(`http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/comments/${postId}`);
        if (!response.ok) throw new Error('댓글 가져오기 실패');

        const data = await response.json();
        const comments = data.comments || [];

        // 댓글 목록 초기화
        const commentList = document.querySelector('.comment-list');
        commentList.innerHTML = '';

        // 각 댓글 표시
        for (const comment of comments) {
            await displayComment(comment);
        }
    } catch (error) {
        console.error('댓글 가져오기 오류:', error);
    }
}

/**
 * 댓글을 화면에 표시하는 함수
 * @param {Object} comment - 댓글 데이터
 */
async function displayComment(comment) {
    const commentList = document.querySelector('.comment-list');
    const commentItem = document.createElement('div');
    commentItem.classList.add('comment-item');
    commentItem.setAttribute('data-comment-id', comment.id);

    // 프로필 이미지 가져오기
    const profileData = await fetchUserProfile(comment.author_email);
    const profileImageUrl =
        // `http://localhost:3000/uploads/profiles/default.png`;
        profileData?.imageUrl || `https://${CLOUDFRONT_DOMAIN}/uploads/profiles/default.webp`;

    // 현재 사용자가 작성자인지 확인
    const currentUser = localStorage.getItem('email');
    const isAuthor = currentUser === comment.author_email;

    // UTC에서 서울 시간으로 변환
    const commentDate = formatKoreanTime(comment.created_at);

    commentItem.innerHTML = `
        <div class="comment-left">
            <div class="profile-image">
                <img src="${profileImageUrl}" 
                     alt="프로필 이미지"
                     style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
            </div>
        </div>
        <div class="comment-right">
            <div class="comment-info">
                <div class="comment-info-left">
                    <div class="comment-author">${comment.author_nickname}</div>
                    <div class="comment-date">${commentDate}</div>
                    ${
                        comment.updated_at &&
                        comment.updated_at !== comment.created_at
                            ? `<div class="comment-edited">(수정됨)</div>`
                            : ''
                    }
                </div>
                ${
                    isAuthor
                        ? `
                    <div class="comment-buttons">
                        <button class="comment-edit-btn">수정</button>
                        <button class="comment-delete-btn">삭제</button>
                    </div>
                `
                        : ''
                }
            </div>

            <div class="comment-text">${comment.content}</div>

            <div class="comment-edit-area" style="display: none;">
                <textarea class="comment-edit-input">${comment.content}</textarea>
                <div class="edit-button-group">
                    <button class="edit-save-btn">저장</button>
                    <button class="edit-cancel-btn">취소</button>
                </div>
            </div>
        </div>
    `;

    commentList.appendChild(commentItem);

    if (isAuthor) {
        setupCommentEventListeners(commentItem, comment.id);
    }
}

/**
 * 댓글의 수정/삭제 이벤트 리스너 설정 함수
 * @param {HTMLElement} commentItem - 댓글 DOM 요소
 * @param {string} commentId - 댓글 ID
 */
function setupCommentEventListeners(commentItem, commentId) {
    const editBtn = commentItem.querySelector('.comment-edit-btn');
    const deleteBtn = commentItem.querySelector('.comment-delete-btn');
    const commentText = commentItem.querySelector('.comment-text');
    const editArea = commentItem.querySelector('.comment-edit-area');
    const saveBtn = commentItem.querySelector('.edit-save-btn');
    const cancelBtn = commentItem.querySelector('.edit-cancel-btn');
    const editInput = commentItem.querySelector('.comment-edit-input');

    // 수정 버튼 클릭
    editBtn?.addEventListener('click', () => {
        editArea.style.display = 'block';
        commentText.style.display = 'none';
        editInput.value = commentText.textContent;
    });

    // 삭제 버튼 클릭
    deleteBtn?.addEventListener('click', () => {
        const modal = document.getElementById('commentDeleteModal');
        if (modal) {
            modal.setAttribute('data-comment-id', commentId);
            openModal('commentDeleteModal');
        }
    });

    // 수정 저장 버튼 클릭
    saveBtn?.addEventListener('click', async () => {
        const newContent = editInput.value.trim();
        if (!newContent) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        try {
            // const response = await fetch(
            //     `http://localhost:3000/comments/${commentId}`,
            //     {
                const response = await fetch(`http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/comments/${commentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: newContent,
                        author_email: localStorage.getItem('email'),
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('댓글 수정 실패');
            }

            const data = await response.json();
            if (data.success) {
                commentText.textContent = newContent;
                editArea.style.display = 'none';
                commentText.style.display = 'block';

                // 수정됨 표시 추가
                const commentInfo = commentItem.querySelector('.comment-info');
                if (!commentInfo.querySelector('.comment-edited')) {
                    const editedSpan = document.createElement('div');
                    editedSpan.classList.add('comment-edited');
                    editedSpan.textContent = '(수정됨)';
                    const buttonsDiv =
                        commentInfo.querySelector('.comment-buttons');
                    if (buttonsDiv) {
                        commentInfo.insertBefore(editedSpan, buttonsDiv);
                    } else {
                        commentInfo.appendChild(editedSpan);
                    }
                }
            }
        } catch (error) {
            console.error('댓글 수정 중 오류:', error);
            alert('댓글 수정에 실패했습니다.');
        }
    });

    // 수정 취소 버튼 클릭
    cancelBtn?.addEventListener('click', () => {
        editArea.style.display = 'none';
        commentText.style.display = 'block';
    });
}

/**
 * 모달 관련 함수들
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.visibility = 'visible';
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.visibility = 'hidden';
        modal.classList.remove('show');
    }
}

// 초기화 시 모달 이벤트 리스너 설정
function initializeCommentModals() {
    const commentDeleteModal = document.getElementById('commentDeleteModal');
    if (!commentDeleteModal) return;

    const oldConfirmBtn = commentDeleteModal.querySelector('.btn-confirm');
    const oldCancelBtn = commentDeleteModal.querySelector('.btn-cancel');

    if (oldConfirmBtn) {
        const newConfirmBtn = oldConfirmBtn.cloneNode(true);
        oldConfirmBtn.parentNode.replaceChild(newConfirmBtn, oldConfirmBtn);
    }

    if (oldCancelBtn) {
        const newCancelBtn = oldCancelBtn.cloneNode(true);
        oldCancelBtn.parentNode.replaceChild(newCancelBtn, oldCancelBtn);
    }

    const confirmBtn = commentDeleteModal.querySelector('.btn-confirm');
    const cancelBtn = commentDeleteModal.querySelector('.btn-cancel');

    confirmBtn?.addEventListener('click', async () => {
        const commentId = commentDeleteModal.getAttribute('data-comment-id');
        if (!commentId) return;

        try {
            await deleteComment(commentId);
            closeModal('commentDeleteModal');
        } catch (error) {
            alert('댓글 삭제에 실패��습니다.');
            closeModal('commentDeleteModal');
        }
    });

    cancelBtn?.addEventListener('click', () => {
        closeModal('commentDeleteModal');
    });
}

/**
 * 페이지 초기화 함수
 */
function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        alert('올바르지 않은 접근입니다.');
        window.location.href = 'posts.html';
        return;
    }

    fetchPost(postId);
    fetchComments(postId);
    setupEventListeners(postId);
    initializeCommentModals(); // 한 번만 호출
}

/**
 * 이벤트 리스너 설정 함수
 * @param {string} postId - 게시글 ID
 */
function setupEventListeners(postId) {
    // 좋아요 버튼 이벤트
    const likeButton = document.querySelector('.stat-item[data-type="likes"]');
    if (likeButton) {
        likeButton.addEventListener('click', () => toggleLike(postId));
    }

    // ���정 버튼 이벤트
    const editButton = document.getElementById('edit-button');
    if (editButton) {
        editButton.addEventListener('click', () => {
            location.href = `edit-post.html?id=${postId}`;
        });
    }

    // 삭제 버튼 이벤트
    const deleteButton = document.querySelector('.post-delete-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', () =>
            openModal('postDeleteModal'),
        );
    }

    // 등록 버튼 이벤트
    const commentSubmitButton = document.querySelector('.comment-submit');
    if (commentSubmitButton) {
        commentSubmitButton.addEventListener('click', () =>
            submitComment(postId),
        );
    }

    // 삭제 모달 버튼 이벤트
    const deleteConfirmBtn = document.querySelector(
        '#postDeleteModal .btn-confirm',
    );
    const deleteCancelBtn = document.querySelector(
        '#postDeleteModal .btn-cancel',
    );

    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', () => {
            handlePostDelete(postId);
            closeModal('postDeleteModal');
        });
    }

    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', () => {
            closeModal('postDeleteModal');
        });
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeCommentModals();
    initializePage();
});

export { fetchPost, displayPost };