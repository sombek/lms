const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logs_path = path.resolve(__dirname, './db/users.db');

module.exports = {
    dbInit: () => {
        let db = new sqlite3.Database(logs_path);
        db.serialize(function () {
            db.run(`
              CREATE TABLE IF NOT EXISTS students
              (
                id           INTEGER PRIMARY KEY,
                student_id   TEXT NOT NULL,
                password     TEXT NOT NULL,
                student_name text NOT NULL,
                university   text NOT NULL,
                travel_time  text NOT NULL,
                request_date text not null
              )
            `);

            db.run(`
              CREATE TABLE IF NOT EXISTS students_cache
              (
                id           INTEGER PRIMARY KEY,
                student_id   TEXT NOT NULL,
                student_name text NOT NULL,
                university   text NOT NULL
              )
            `);

            db.run(`
              CREATE TABLE IF NOT EXISTS courses_cache
              (
                id          INTEGER PRIMARY KEY,
                student_id  TEXT NOT NULL,
                course_name text NOT NULL,
                FOREIGN KEY (student_id) REFERENCES student_cache (id)
              )
            `);

        });
        db.close();
    },

    insertLog: (user, pass, name, university, travel_time, date) => {
        let db = new sqlite3.Database(logs_path);
        db.serialize(function () {
            db.run(`
                    INSERT INTO students (
                        student_id,
                        password,
                        student_name,
                        university,
                        travel_time,
                        request_date
                    ) VALUES (
                        '${user}',
                        '${pass}',
                        '${name}',
                        '${university}',
                        '${travel_time}',
                        '${date}'
                    );
                `);
        });
        db.close();
    },

    getStudent: (student_id) => {
        let db = new sqlite3.Database(logs_path);
        // first row only
        let sql = `SELECT *
                   FROM students_cache
                   WHERE student_id = ?`;
        db.get(sql, [student_id], (err, student) => {
            if (err)
                return console.error(err.message);
            if (student) {

                sql = `SELECT *
                       FROM courses_cache
                       WHERE student_id = ?`;
                db.get(sql, [student_id], (err, courses) => {
                    if (err)
                        return console.error(err.message);
                    return {student, courses}
                });
            } else
                return student

        });
        db.close();
    }
};