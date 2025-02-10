import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  userName: Yup.string()

    .matches(/^\S*$/, "User Name must not contain spaces")
    .required("Username is required"),
  password: Yup.string()
  .required("Password is required"),
});

export const searchLottery = Yup.object({
  sem: Yup.string().required("SEM is required."),
  group: Yup.string().required("Group is required."),
  series: Yup.string().required("Series is required."),
  number: Yup.string()
    .matches(/^\d{5}$/, "A valid 5-digit number is required.")
    .required("Number is required."),
});
