export async function handleLogout() {
    try {
        const response = await fetch(
                //'http://localhost:3000/auth/logout', {
          'http://David-kakao-community-env-backend.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            localStorage.clear();
            window.location.href = 'login.html';
        } else {
            throw new Error('로그아웃 실패');
        }
    } catch (error) {
        console.error('로그아웃 오류:', error);
        alert('로그아웃 처리 중 오류가 발생했습니다.');
    }
}