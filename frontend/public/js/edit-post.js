/**
 * 게시글 데이터를 서버에서 가져오는 함수
 * @param {string} postId - 수정할 게시글의 ID
 */
async function fetchPost(postId) {
    try {
        //const response = await fetch(`http://localhost:3000/posts/${postId}`);
        const response = await fetch(`http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/posts/${postId}`);
        if (!response.ok) {
            throw new Error('게시글을 가져오는 데 실패했습니다.');
        }
        const data = await response.json();
        populateForm(data.post);
    } catch (error) {
        console.error(error);
        alert('게시글을 불러오는데 실패했습니다.');
    }
}

/**
 * 폼에 기존 게시글 데이터를 채우는 함수
 * @param {Object} post - 게시글 데이터 객체
 */
function populateForm(post) {
    if (!post) return;

    // 기본 필드 채우기
    document.getElementById('title').value = post.title;
    document.getElementById('content').value = post.content;

    // 이미지 미리보기 처리
    const imagePreview = document.getElementById('imagePreview');
    if (post.image && imagePreview) {
        //imagePreview.src = `http://localhost:3000/posts/${post.image}`;
        imagePreview.src = `http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/posts/${post.image}`;
        imagePreview.style.display = 'block';
    }

    // 원본 닉네임 저장 (hidden input 생성)
    if (!document.getElementById('originalNickname')) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'originalNickname';
        document.body.appendChild(hiddenInput);
    }
    document.getElementById('originalNickname').value = post.nickname;
}

/**
 * 수정된 게시글을 서버에 제출하는 함수
 */
async function reSubmitPost() {
    // 필요한 데이터 수집
    const postId = new URLSearchParams(window.location.search).get('id');
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const nickname = document.getElementById('originalNickname').value;
    const imageInput = document.getElementById('imageUpload');

    // FormData 객체 생성 및 데이터 추가
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('nickname', nickname);

    // 새로운 이미지가 선택된 경우 추가
    if (imageInput && imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        // 서버에 게시글 수정 요청
        //const response = await fetch(`http://localhost:3000/posts/${postId}`, {
        const response = await fetch(`http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/posts/${postId}`, {
            method: 'PUT',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('게시글 수정에 실패했습니다.');
        }

        alert('게시글이 수정되었습니다.');
        window.location.href = 'post-detail.html?id=' + postId;
    } catch (error) {
        console.error(error);
        alert('게시글 수정 중 오류가 발생했습니다.');
    }
}

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // URL에서 게시글 ID 추출
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        fetchPost(postId);
    } else {
        console.error('게시물 ID가 없습니다.');
    }

    // 폼 제출 이벤트 리스너 등록
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            reSubmitPost();
        });
    }
});