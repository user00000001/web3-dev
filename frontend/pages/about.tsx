import React from "react";
import axios from "axios";

function About({ data }: { data: { message: string } }) {
  return (
    <div className=" mx-10 text-center text-red-400 max-md:bg-red-500 max-md:text-green-300 bg-green-300 text-lg">
      About: {data.message}
    </div>
  );
}

export default About;

export async function getServerSideProps() {
  const { data } = await axios.get("http://127.0.0.1:3000/frontend/api/hello");
  return {
    props: { data },
  };
}
