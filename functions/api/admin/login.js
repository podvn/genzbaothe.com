async function login() {

  const password =
    document.getElementById("password").value;

  if (!password) {
    alert("Vui lòng nhập mật khẩu.");
    return;
  }

  try {

    const response =
      await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password
        })
      });

    const result =
      await response.json().catch(() => ({}));

    if (!response.ok) {

      alert(
        result.error ||
        "Đăng nhập thất bại."
      );

      return;
    }

    token = result.token;

    sessionStorage.setItem(
      "genzbaothe_admin_token",
      token
    );

    loadAdmin();

  } catch (error) {

    console.error(error);

    alert(
      "Không kết nối được tới máy chủ."
    );

  }

}
