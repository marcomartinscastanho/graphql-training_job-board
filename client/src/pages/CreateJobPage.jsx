import { useState } from "react";
import { useNavigate } from "react-router";
import { createJobMutation, jobByIdQuery } from "../lib/graphql/queries";
import { useMutation } from "@apollo/client";

function CreateJobPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // unlike queries, useMutation doesn't send the mutation when called
  // only when the returned "mutate" function is called
  // so that we can control when the mutation is called (when the form is submitted)
  // and not automatically when the page is loaded
  const [mutate, { loading }] = useMutation(createJobMutation);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const {
      data: { job },
    } = await mutate({
      variables: { input: { title, description } },
      // what this does is: when we call the mutation to create the job, it returns the created job
      // so we explicitly add the returned data to the cache
      // so that the next time this job is queried, it's already in cache
      update: (cache, { data }) => {
        cache.writeQuery({
          query: jobByIdQuery,
          variables: { id: data.job.id },
          data,
        });
      },
    });
    navigate(`/jobs/${job.id}`);
  };

  return (
    <div>
      <h1 className="title">New Job</h1>
      <div className="box">
        <form>
          <div className="field">
            <label className="label">Title</label>
            <div className="control">
              <input className="input" type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <div className="control">
              <textarea className="textarea" rows={10} value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button className="button is-link" onClick={handleSubmit} disabled={loading}>
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJobPage;
