import { expectTypeOf } from "vitest";
import type {
  Gassma,
  GassmaClient,
  GassmaCourseUse,
  GassmaCourseWhereUse,
  GassmaEnrollmentCreateData,
  GassmaEnrollmentUpsertSingleData,
  GassmaEnrollmentUse,
  GassmaStudentUse,
  GassmaStudentWhereUse,
} from "../__generated__/client";

declare const client: GassmaClient;

// 複数FKモデルの create data は FK ごとの XOR の交差になる
{
  expectTypeOf<GassmaEnrollmentCreateData["data"]>().toEqualTypeOf<
    Gassma.RawAllowed<Omit<GassmaEnrollmentUse, "studentId" | "courseId">> &
      (
        | Gassma.RawAllowed<Pick<GassmaEnrollmentUse, "studentId">>
        | {
            student: {
              create?: Gassma.RawAllowed<GassmaStudentUse>;
              connect?: GassmaStudentWhereUse;
              connectOrCreate?: {
                where: GassmaStudentWhereUse;
                create: Gassma.RawAllowed<GassmaStudentUse>;
              };
            };
          }
      ) &
      (
        | Gassma.RawAllowed<Pick<GassmaEnrollmentUse, "courseId">>
        | {
            course: {
              create?: Gassma.RawAllowed<GassmaCourseUse>;
              connect?: GassmaCourseWhereUse;
              connectOrCreate?: {
                where: GassmaCourseWhereUse;
                create: Gassma.RawAllowed<GassmaCourseUse>;
              };
            };
          }
      )
  >();
}

// 各 XOR 腕の relation op は create 文脈の 3 op のみ
{
  type EC = GassmaEnrollmentCreateData["data"];
  type StudentOps = Extract<EC, { student: unknown }>["student"];
  expectTypeOf<keyof StudentOps>().toEqualTypeOf<
    "create" | "connect" | "connectOrCreate"
  >();
  type CourseOps = Extract<EC, { course: unknown }>["course"];
  expectTypeOf<keyof CourseOps>().toEqualTypeOf<
    "create" | "connect" | "connectOrCreate"
  >();
}

// 両FK直指定 / 片方直・片方 relation / 両方 relation のすべてが通る
{
  client.Enrollment.create({ data: { studentId: 1, courseId: 1 } });
  client.Enrollment.create({
    data: { studentId: 1, course: { connect: { id: 1 } } },
  });
  client.Enrollment.create({
    data: { student: { connect: { id: 1 } }, courseId: 1 },
  });
  client.Enrollment.create({
    data: {
      student: { connect: { id: 1 } },
      course: { connect: { id: 1 } },
    },
  });
  client.Enrollment.create({
    data: {
      student: { create: { name: "s" } },
      course: {
        connectOrCreate: { where: { id: 1 }, create: { title: "c" } },
      },
    },
  });
}

// 片側でも FK / relation の両方が欠けるとエラー
{
  // @ts-expect-error course も courseId も無い
  client.Enrollment.create({ data: { studentId: 1 } });
  // @ts-expect-error student も studentId も無い
  client.Enrollment.create({ data: { course: { connect: { id: 1 } } } });
  // @ts-expect-error 両側とも無い
  client.Enrollment.create({ data: {} });
}

// upsert.create も create data と同一の XOR 交差
{
  expectTypeOf<GassmaEnrollmentUpsertSingleData["create"]>().toEqualTypeOf<
    GassmaEnrollmentCreateData["data"]
  >();
}
