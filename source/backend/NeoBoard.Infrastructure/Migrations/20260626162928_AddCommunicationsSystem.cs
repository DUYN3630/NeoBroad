using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeoBoard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCommunicationsSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop existing tables if they already exist to avoid table-already-exists conflicts
            migrationBuilder.Sql("DROP TABLE IF EXISTS `announcementreads`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `postcomments`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `surveyresponses`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `surveyquestions`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `surveys`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `timelineposts`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `announcements`;");

            migrationBuilder.CreateTable(
                name: "announcements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    authorid = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    title = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    content = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    priority = table.Column<int>(type: "int", nullable: false),
                    ispublished = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    publishedat = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    expiresat = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_announcements", x => x.id);
                    table.ForeignKey(
                        name: "fk_announcements_users_authorid",
                        column: x => x.authorid,
                        principalTable: "users",
                        principalColumn: "id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "surveys",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    creatorid = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    title = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<int>(type: "int", nullable: false),
                    startsat = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    endsat = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_surveys", x => x.id);
                    table.ForeignKey(
                        name: "fk_surveys_users_creatorid",
                        column: x => x.creatorid,
                        principalTable: "users",
                        principalColumn: "id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "timelineposts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    authorid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    content = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    imageurl = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    likecount = table.Column<int>(type: "int", nullable: false),
                    commentcount = table.Column<int>(type: "int", nullable: false),
                    ispublished = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updatedat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_timelineposts", x => x.id);
                    table.ForeignKey(
                        name: "fk_timelineposts_users_authorid",
                        column: x => x.authorid,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "announcementreads",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    announcementid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    userid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    readat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_announcementreads", x => x.id);
                    table.ForeignKey(
                        name: "fk_announcementreads_announcements_announcementid",
                        column: x => x.announcementid,
                        principalTable: "announcements",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_announcementreads_users_userid",
                        column: x => x.userid,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "surveyquestions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    surveyid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    questiontext = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    questiontype = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    options = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    isrequired = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    sortorder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_surveyquestions", x => x.id);
                    table.ForeignKey(
                        name: "fk_surveyquestions_surveys_surveyid",
                        column: x => x.surveyid,
                        principalTable: "surveys",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "postcomments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    postid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    authorid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    content = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_postcomments", x => x.id);
                    table.ForeignKey(
                        name: "fk_postcomments_timelineposts_postid",
                        column: x => x.postid,
                        principalTable: "timelineposts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_postcomments_users_authorid",
                        column: x => x.authorid,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "surveyresponses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    questionid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    userid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    answer = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_surveyresponses", x => x.id);
                    table.ForeignKey(
                        name: "fk_surveyresponses_surveyquestions_questionid",
                        column: x => x.questionid,
                        principalTable: "surveyquestions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_surveyresponses_users_userid",
                        column: x => x.userid,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_announcementreads_announcementid",
                table: "announcementreads",
                column: "announcementid");

            migrationBuilder.CreateIndex(
                name: "ix_announcementreads_userid",
                table: "announcementreads",
                column: "userid");

            migrationBuilder.CreateIndex(
                name: "ix_announcements_authorid",
                table: "announcements",
                column: "authorid");

            migrationBuilder.CreateIndex(
                name: "ix_postcomments_authorid",
                table: "postcomments",
                column: "authorid");

            migrationBuilder.CreateIndex(
                name: "ix_postcomments_postid",
                table: "postcomments",
                column: "postid");

            migrationBuilder.CreateIndex(
                name: "ix_surveyquestions_surveyid",
                table: "surveyquestions",
                column: "surveyid");

            migrationBuilder.CreateIndex(
                name: "ix_surveyresponses_questionid",
                table: "surveyresponses",
                column: "questionid");

            migrationBuilder.CreateIndex(
                name: "ix_surveyresponses_userid",
                table: "surveyresponses",
                column: "userid");

            migrationBuilder.CreateIndex(
                name: "ix_surveys_creatorid",
                table: "surveys",
                column: "creatorid");

            migrationBuilder.CreateIndex(
                name: "ix_timelineposts_authorid",
                table: "timelineposts",
                column: "authorid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "announcementreads");

            migrationBuilder.DropTable(
                name: "postcomments");

            migrationBuilder.DropTable(
                name: "surveyresponses");

            migrationBuilder.DropTable(
                name: "announcements");

            migrationBuilder.DropTable(
                name: "timelineposts");

            migrationBuilder.DropTable(
                name: "surveyquestions");

            migrationBuilder.DropTable(
                name: "surveys");
        }
    }
}
