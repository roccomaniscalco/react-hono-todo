import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { hc, type InferResponseType } from "hono/client";
import type { ApiType } from "../functions/api/[[route]]";

const api = hc<ApiType>("/").api;
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
      <TodoInput />
    </QueryClientProvider>
  );
}

function Todos() {
  const { data: todos } = useQuery({
    queryKey: ["getTodos"],
    queryFn: () => api.todos.$get().then((res) => res.json()),
  });

  return (
    <ul>
      {todos?.map((todo) => (
        <Todo key={todo.id} {...todo} />
      ))}
    </ul>
  );
}

type TodoProps = InferResponseType<typeof api.todos.$get>[number];
function Todo(props: TodoProps) {
  const id = String(props.id);
  const isCompleted = Boolean(props.isCompleted);

  const qc = useQueryClient();
  const { mutate: toggleTodo, isPending } = useMutation({
    mutationKey: ["toggleTodo"],
    mutationFn: () =>
      api.todo[":id"].$put({
        param: { id },
        json: { isCompleted: !isCompleted },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["getTodos"] }),
  });

  return (
    <li>
      <label htmlFor={id}>{props.title}</label>
      <input
        type="checkbox"
        id={id}
        name={props.title}
        checked={isCompleted}
        onChange={() => toggleTodo()}
        disabled={isPending}
      />
    </li>
  );
}

function TodoInput() {
  const qc = useQueryClient();
  const { mutate: createTodo, isPending: isCreatingTodo } = useMutation({
    mutationKey: ["createTodo"],
    mutationFn: (title: string) =>
      api.todo.$post({ json: { title } }).then((res) => res.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["getTodos"] }),
  });

  return (
    <form
      onSubmit={(e) => {
        if (isCreatingTodo) return;
        e.preventDefault();
        const title = new FormData(e.currentTarget).get("title") as string;
        createTodo(title);
        e.currentTarget.reset();
      }}
    >
      <input name="title" placeholder="Enter a todo" />
      <button type="submit" disabled={isCreatingTodo}>
        Create
      </button>
    </form>
  );
}
