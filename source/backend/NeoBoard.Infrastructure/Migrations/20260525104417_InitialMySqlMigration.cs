using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeoBoard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialMySqlMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "assets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    serialnumber = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    type = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    department = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    price = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    lastmaintenance = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assets", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "toolsets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    totalquantity = table.Column<int>(type: "int", nullable: false),
                    availablequantity = table.Column<int>(type: "int", nullable: false),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_toolsets", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    email = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    passwordhash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    fullname = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    avatarurl = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    role = table.Column<int>(type: "int", nullable: false),
                    department = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    isactive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    lastloginat = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updatedat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

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
                name: "borrowrequests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    userid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    requestdate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    expectedreturndate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    purpose = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    approvedbyid = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    note = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_borrowrequests", x => x.id);
                    table.ForeignKey(
                        name: "fk_borrowrequests_users_approvedbyid",
                        column: x => x.approvedbyid,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_borrowrequests_users_userid",
                        column: x => x.userid,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "fileattachments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    uploadedbyid = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    filename = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    originalname = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    contenttype = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    filesizebytes = table.Column<long>(type: "bigint", nullable: true),
                    storagepath = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    entitytype = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    entityid = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_fileattachments", x => x.id);
                    table.ForeignKey(
                        name: "fk_fileattachments_users_uploadedbyid",
                        column: x => x.uploadedbyid,
                        principalTable: "users",
                        principalColumn: "id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    userid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    title = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    message = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    type = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    referenceid = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    isread = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                    table.ForeignKey(
                        name: "fk_notifications_users_userid",
                        column: x => x.userid,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "refreshtokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    userid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    token = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    expiresat = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    isrevoked = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_refreshtokens", x => x.id);
                    table.ForeignKey(
                        name: "fk_refreshtokens_users_userid",
                        column: x => x.userid,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
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
                name: "useractivities",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    userid = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    action = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ipaddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_useractivities", x => x.id);
                    table.ForeignKey(
                        name: "fk_useractivities_users_userid",
                        column: x => x.userid,
                        principalTable: "users",
                        principalColumn: "id");
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
                name: "borrowitems",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    borrowrequestid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    assetid = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    toolsetid = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    conditiononborrow = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    conditiononreturn = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    actualreturndate = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_borrowitems", x => x.id);
                    table.ForeignKey(
                        name: "fk_borrowitems_assets_assetid",
                        column: x => x.assetid,
                        principalTable: "assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_borrowitems_borrowrequests_borrowrequestid",
                        column: x => x.borrowrequestid,
                        principalTable: "borrowrequests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_borrowitems_toolsets_toolsetid",
                        column: x => x.toolsetid,
                        principalTable: "toolsets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
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
                name: "ix_borrowitems_assetid",
                table: "borrowitems",
                column: "assetid");

            migrationBuilder.CreateIndex(
                name: "ix_borrowitems_borrowrequestid",
                table: "borrowitems",
                column: "borrowrequestid");

            migrationBuilder.CreateIndex(
                name: "ix_borrowitems_toolsetid",
                table: "borrowitems",
                column: "toolsetid");

            migrationBuilder.CreateIndex(
                name: "ix_borrowrequests_approvedbyid",
                table: "borrowrequests",
                column: "approvedbyid");

            migrationBuilder.CreateIndex(
                name: "ix_borrowrequests_userid",
                table: "borrowrequests",
                column: "userid");

            migrationBuilder.CreateIndex(
                name: "ix_fileattachments_uploadedbyid",
                table: "fileattachments",
                column: "uploadedbyid");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_userid",
                table: "notifications",
                column: "userid");

            migrationBuilder.CreateIndex(
                name: "ix_postcomments_authorid",
                table: "postcomments",
                column: "authorid");

            migrationBuilder.CreateIndex(
                name: "ix_postcomments_postid",
                table: "postcomments",
                column: "postid");

            migrationBuilder.CreateIndex(
                name: "ix_refreshtokens_userid",
                table: "refreshtokens",
                column: "userid");

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

            migrationBuilder.CreateIndex(
                name: "ix_useractivities_userid",
                table: "useractivities",
                column: "userid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "announcementreads");

            migrationBuilder.DropTable(
                name: "borrowitems");

            migrationBuilder.DropTable(
                name: "fileattachments");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "postcomments");

            migrationBuilder.DropTable(
                name: "refreshtokens");

            migrationBuilder.DropTable(
                name: "surveyresponses");

            migrationBuilder.DropTable(
                name: "useractivities");

            migrationBuilder.DropTable(
                name: "announcements");

            migrationBuilder.DropTable(
                name: "assets");

            migrationBuilder.DropTable(
                name: "borrowrequests");

            migrationBuilder.DropTable(
                name: "toolsets");

            migrationBuilder.DropTable(
                name: "timelineposts");

            migrationBuilder.DropTable(
                name: "surveyquestions");

            migrationBuilder.DropTable(
                name: "surveys");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
