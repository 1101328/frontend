import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { useState } from "react";
import { containerStyle, nameRowStyle, labelSpanStyle, inputStyle,
    birthlabelStyle, birthspanStyle, birthinputStyle,
    phoneLabelStyle, phoneSpanStyle, phoneInputStyle,
    addressLabelStyle, addressSpanStyle, addressInputStyle} from "~/styles/style";


const departmentOptions: Record<string, string[]> = {
  "개발본부": ["제1개발부", "제2개발부", "한국지사", "교육그룹", "AI솔루션그룹"],
  "ICT본부": ["제1그룹", "제2그룹", "제3그룹", "제4그룹"],
  "사회인프라사업부": ["설계·품질그룹", "토호쿠사업소", "후쿠오카사업소", "스마트에너지솔루션부"],
  "경영지원실": ["인사그룹", "경리그룹", "총무그룹"],
  "영업본부": ["영업본부"],
  "품질관리부": ["품질관리부"],
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const loginId = session.get("userId");
  if (!loginId) return redirect("/login");

  const userInfo = await db.findUserInfoByLoginId(loginId);
  if (userInfo) return redirect("/");

  return json({ loginId });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const loginId = session.get("userId");
  if (!loginId) return redirect("/login");

  const formData = await request.formData();
  await db.insertUserInfo({
    loginId,
    first_name: formData.get("first") as string,
    last_name: formData.get("last") as string,
    first_name_kana: formData.get("first_kana") as string,
    last_name_kana: formData.get("last_kana") as string,
    birth: formData.get("birth") as string,
    phone_number: formData.get("phonenumber") as string,
    address: formData.get("address") as string,
    gender_id: formData.get("gender") === "male" ? 1 : formData.get("gender") === "female" ? 2 : 3,
    position_id: {
      staff: 10,
      assistant_manager: 20,
      manager: 30,
      senior_manager: 40,
      deputy_general_manager: 50,
      general_manager: 60,
    }[formData.get("position") as string],
    upper_department: formData.get("upper_department") as string,
    lower_department: Number(formData.get("lower_department")),
    career_start_date: formData.get("career_start_date") as string,
    notes: formData.get("notes") as string,
  });

  return redirect("/");
}

export default function NewUserForm() {
  const [upperDept, setUpperDept] = useState("");
  const [lowerDept, setLowerDept] = useState("");

  return (
    <Form method="post" style={{ maxWidth: 800, margin: "auto", padding: "2rem" }}>
      <h1>개인정보 등록</h1>
      <p style={nameRowStyle}>
        <span style={labelSpanStyle}>Name</span>
        <input name="first" placeholder="First" type="text" required style={inputStyle} />
        <input name="last" placeholder="Last" type="text" required style={inputStyle} />
      </p>
      <p style={nameRowStyle}>
        <span style={labelSpanStyle}>Name Kana</span>
        <input name="first_kana" placeholder="First Kana" type="text" required style={inputStyle} />
        <input name="last_kana" placeholder="Last Kana" type="text" required style={inputStyle} />
      </p>
      <label style={birthlabelStyle}>
  <span style={birthspanStyle}>Birth</span>
  <input name="birth" type="date" required style={birthinputStyle} />
</label>
      <fieldset style={{ border: "none", padding: 0, marginBottom: "1rem" }}>
        <legend style={{ marginBottom: "0.5rem" }}>Gender</legend>
        <div style={{ display: "flex", gap: "1rem" }}>
          <label><input type="radio" name="gender" value="male" required /> Male</label>
          <label><input type="radio" name="gender" value="female" /> Female</label>
          <label><input type="radio" name="gender" value="others" /> Others</label>
        </div>
      </fieldset>
     <label style={phoneLabelStyle}>
  <span style={phoneSpanStyle}>Phone number</span>
  <input
    name="phonenumber"
    placeholder="08012345678"
    type="tel"
    required
    style={phoneInputStyle}
  />
</label>
      <label style={addressLabelStyle}>
  <span style={addressSpanStyle}>Address</span>
  <input name="address" type="text" placeholder="Your address" style={addressInputStyle} />
      </label>
      <fieldset style={{ border: "none", padding: 2, marginBottom: "1rem" }}>
  <legend style={{ marginBottom: "0.5rem", marginLeft: "-5px" }}>Position</legend>
  <div style={{ display: "flex", gap: "1rem" }}>
    {[
      { value: "staff", label: "사원" },
      { value: "assistant_manager", label: "주임" },
      { value: "manager", label: "대리" },
      { value: "senior_manager", label: "과장" },
      { value: "deputy_general_manager", label: "차장" },
      { value: "general_manager", label: "부장" },
    ].map(({ value, label }) => (
      <label key={value}>
        <input type="radio" name="position" value={value} required /> {label}
      </label>
    ))}
  </div>
</fieldset>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
        <label>
          <span>Main department</span><br />
          <select
            name="upper_department"
            value={upperDept}
            onChange={(e) => {
              setUpperDept(e.target.value);
              setLowerDept("");
            }} required
          >
            <option value="">Choose</option>
            {Object.keys(departmentOptions).map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </label>
        {upperDept && (
          <label>
            <span>Sub department</span><br />
            <select
              name="lower_department"
              value={lowerDept}
              onChange={(e) => setLowerDept(e.target.value)} required
            >
              <option value="">Choose</option>
              {departmentOptions[upperDept].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <label>
        <span>Career start date</span>
        <input name="career_start_date" type="date" required />
      </label>
      <label>
        <span>Notes</span>
        <textarea name="notes" rows={6} />
      </label>
      <p style={{ marginTop: "1rem" }}>
        <button type="submit">등록</button>
      </p>
    </Form>
  );
}
