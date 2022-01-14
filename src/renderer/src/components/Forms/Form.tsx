import * as React from "react";
import { ReactElement } from "react";
import { withFormik, FormikProps, useFormik, FormikValues } from "formik";
import { TextFieldProps } from "./TextField";

interface FormProps {
  children?: React.ReactNode;
  initialValues: FormikValues;
}

export const Form = ({ children, initialValues }: FormProps) => {
  const { handleSubmit } = useFormik({
    initialValues,
    onSubmit: (values) => {
      alert("testing");
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {children}
      <button type="submit">Sign In</button>
    </form>
  );
};

// export const FormikForm = withFormik<MyFormProps, FormValues>({
//   mapPropsToValues: (props) => ({
//     username: props.initialUsername || "",
//   }),

//   validationSchema: Yup.object().shape({
//     username: Yup.string().required("Username required"),
//   }),

//   handleSubmit({ username }: FormValues, { props, setSubmitting, setErrors }) {
//     console.log(username);
//   },
// })(InnerForm);
