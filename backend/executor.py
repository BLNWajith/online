import subprocess
import tempfile
import os
import shutil

def execute_code(code, language, version):
    try:
        # Create temporary file
        suffix = ".py" if language == "python" else ".java"
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(code)
            tmp_file.flush()
            code_path = tmp_file.name

        if language == "python":
            python_exec = shutil.which(f"python{version}")
            if not python_exec:
                return f"Python {version} not found on system."
            cmd = [python_exec, code_path]

        elif language == "java":
            if not shutil.which("javac"):
                return "javac compiler not found on system."
            if not shutil.which("java"):
                return "java runtime not found on system."

            compile_cmd = ["javac", code_path]
            compile_result = subprocess.run(compile_cmd, capture_output=True, text=True)
            if compile_result.returncode != 0:
                return compile_result.stderr

            class_name = os.path.splitext(os.path.basename(code_path))[0]
            cmd = ["java", "-cp", os.path.dirname(code_path), class_name]

        else:
            return "Unsupported language"

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        return result.stdout if result.returncode == 0 else result.stderr

    except subprocess.TimeoutExpired:
        return "Execution timed out."
    except Exception as e:
        return f"Error: {str(e)}"
    finally:
        try:
            os.remove(code_path)
        except:
            pass
