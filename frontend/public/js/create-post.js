/**
 * 게시글 작성을 처리하는 함수
 * - 제목, 내용 필수 입력 확인
 * - 이미지 파일 유효성 검사
 * - 서버에 게시글 등록 요청
 */
const submitPost = async () => {
    // DOM 요소 참조
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const imageUploadInput = document.getElementById('imageUpload');

    // 입력값 가져오기
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const nickname = localStorage.getItem('nickname') || '익명';
    const author_email = localStorage.getItem('email');

    // 필수 입력값 검증
    if (!title || !content) {
        alert('제목과 내용은 필수입니다.');
        return;
    }

    // 로그인 상태 확인
    if (!author_email) {
        alert('로그인이 필요합니다.');
        return;
    }

    // 이미지 파일 유효성 검사
    if (imageUploadInput.files.length > 0) {
        const file = imageUploadInput.files[0];

        // 파일 크기 제한 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('이미지 크기는 5MB를 초과할 수 없습니다.');
            return;
        }

        // 허용된 파일 형식 검사
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert(
                '지원하지 않는 파일 형식입니다. JPEG, PNG, GIF 파일만 업로드 가능합니다.',
            );
            return;
        }
    }

    // FormData 객체 생성 및 데이터 추가
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('nickname', nickname);
    formData.append('author_email', author_email);
    if (imageUploadInput.files.length > 0) {
        formData.append('image', imageUploadInput.files[0]);
    }

    try {
        // 서버에 게시글 등록 요청
        const response = await fetch(
            //'http://localhost:3000/posts/create-post',
            //{
                // const response = await fetch(
            // '/api/posts/create-post',
            'http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/posts/create-post',
            {
                method: 'POST',
                body: formData,
                credentials: 'include',
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '게시물 작성에 실패했습니다.');
        }

        const data = await response.json();

        // 게시글 등록 성공 처리
        if (data.success) {
            alert('게시물이 성공적으로 작성되었습니다!');
            window.location.href = 'posts.html';
        } else {
            alert(data.error || '게시물 작성에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        alert(error.message);
    }
};