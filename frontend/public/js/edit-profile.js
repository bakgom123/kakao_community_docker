/**
 * 프로필 수정 페이지의 초기화 및 이벤트 처리를 담당하는 코드
 */
document.addEventListener('DOMContentLoaded', function () {
    // DOM 요소 참조
    const profileImageContainer = document.getElementById(
        'profileImageContainer',
    );
    const profileUpload = document.getElementById('profileUpload');
    const profilePreview = document.getElementById('profilePreview');
    const email = localStorage.getItem('email');

    /**
     * 현재 사용자의 프로필 이미지를 서버에서 가져와 표시
     */
    //fetch(`http://localhost:3000/user/profile-image/${email}`)
    fetch(`http://43.203.237.161/api/user/profile-image/${email}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 프로필 이미지 URL 설정 (없으면 기본 이미지 사용)
               // const imageUrl = data.profileImage
                 //   ? `http://localhost:3000/uploads/profiles/${data.profileImage}`
                   // : 'http://localhost:3000/uploads/profiles/default.webp';
                const imageUrl = data.imageUrl || `https://${CLOUDFRONT_DOMAIN}/uploads/profiles/default.webp`;
                profilePreview.src = imageUrl;
            }
        })
        .catch(error => {
            console.error('프로필 이미지 로드 오류:', error);
            profilePreview.src =
               // 'http://localhost:3000/uploads/profiles/default.webp';
            //     profilePreview.src =
                  '/api/uploads/profiles/default.webp';
            // });
        });

    // 프로필 이미지 클릭 시 파일 선택 다이얼로그 표시
    profileImageContainer.addEventListener('click', () => {
        profileUpload.click();
    });

    // 이미지 파일 선택 시 미리보기 표시
    profileUpload.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                profilePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 닉네임 입력 필드 유효성 검사
    const nicknameInput = document.getElementById('nickname');
    const nicknameError = document.getElementById('nicknameError');

    nicknameInput.addEventListener('input', () => {
        const nickname = nicknameInput.value;
        // 닉네임 길이 제한 (2-10자)
        if (nickname.length < 2 || nickname.length > 10) {
            nicknameError.style.display = 'block';
        } else {
            nicknameError.style.display = 'none';
        }
    });

    // 회원 탈퇴 관련 요소 및 이벤트 처리
    const withdrawButton = document.getElementById('withdrawButton');
    const confirmPopup = document.getElementById('confirmPopup');
    const cancelBtn = confirmPopup.querySelector('.cancel-btn');
    const confirmBtn = confirmPopup.querySelector('.confirm-btn');

    // 탈퇴 버튼 클릭 시 확인 팝업 표시
    withdrawButton.addEventListener('click', () => {
        confirmPopup.classList.add('show');
    });

    // 취소 버튼 클릭 시 팝업 닫기
    cancelBtn.addEventListener('click', () => {
        confirmPopup.classList.remove('show');
    });

    // 이메일 필드 초기화
    const emailInput = document.querySelector('input[type="email"]');
    emailInput.value = localStorage.getItem('email');

    /**
     * 회원 탈퇴 처리
     */
    confirmBtn.addEventListener('click', () => {
        const email = localStorage.getItem('email');
        // 서버에 탈퇴 요청
        // fetch('http://localhost:3000/auth/withdraw', {
        fetch('http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/auth/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('회원 탈퇴가 완료되었습니다.');
                    localStorage.removeItem('email');
                    window.location.href = 'login.html';
                } else {
                    alert('회원 탈퇴 처리 중 오류가 발생했습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('회원 탈퇴 처리 중 오류가 발생했습니다.');
            })
            .finally(() => {
                confirmPopup.classList.remove('show');
            });
    });

    // 프로필 저장 버튼
    const saveButton = document.getElementById('saveButton');

    /**
     * 프로�� 정보 저장 처리
     */
    saveButton.addEventListener('click', async () => {
        const nickname = nicknameInput.value;

        // 닉네임 유효성 검사
        if (nickname.length < 2 || nickname.length > 10) {
            nicknameError.style.display = 'block';
            return;
        }

        try {
            // 프로필 이미지 업데이트 (새 이미지가 있는 경우)
            if (profileUpload.files[0]) {
                const reader = new FileReader();
                reader.readAsDataURL(profileUpload.files[0]);
                reader.onload = async () => {
                    await fetch(
                        // 'http://localhost:3000/user/update-profile-image',
                        'http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/user/update-profile-image',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email: email,
                                profileImage: reader.result,
                            }),
                        },
                    );
                };
            }

            // 닉네임 업데이트
            const nicknameResponse = await fetch(
                //'http://localhost:3000/user/update-nickname',
                'http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/user/update-nickname',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        nickname: nickname,
                    }),
                },
            );

            const nicknameData = await nicknameResponse.json();
            if (nicknameData.success) {
                localStorage.setItem('nickname', nickname); // 로컬스토리지 닉���임 업데이트, 댓글등 다른 곳의 닉네임은 로컬스토리지에서 가져옴
                alert('프로필이 성공적으로 업데이트되었습니다!');
                location.href = 'posts.html';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        }
    });
});