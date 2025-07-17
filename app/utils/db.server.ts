// app/utils/db.server.ts
import { Pool } from "pg";

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = {
  // 이메일로 login_info에서 유저 찾기
  async findUserByEmail(email: string) {
    const result = await pool.query(
      `SELECT * FROM login_info 
       WHERE email = $1 AND is_deleted = FALSE`,
      [email]
    );
    return result.rows[0]; // 유저 없으면 undefined 반환
  },

  // login_info 테이블에 유저 삽입
  async insertUserToLoginInfo({
    email,
    pw_hash,
    role_id = 20, // 기본값: 일반 사용자
  }: {
    email: string;
    pw_hash: string;
    role_id?: number;
  }) {
    const result = await pool.query(
      `INSERT INTO login_info
        (email, pw_hash, role_id, create_user, update_user)
       VALUES ($1, $2, $3, $1, $1)
       RETURNING *`,
      [email, pw_hash, role_id]
    );
    return result.rows[0]; // login_id 포함된 유저 정보 반환
  },

  // login_id 기준으로 user_info에 등록된 사용자 찾기
  async findUserInfoByLoginId(login_id: number) {
    const result = await pool.query(
      `SELECT * FROM user_info 
       WHERE login_id = $1 AND is_deleted = FALSE`,
      [login_id]
    );
    return result.rows[0]; // 등록 안 됐으면 undefined 반환
  },
};
