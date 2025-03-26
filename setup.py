from setuptools import setup, find_packages
from pathlib import Path

# Fetch version dynamically using `setuptools_scm` or fallback to a VERSION file
def get_version():
    try:
        import setuptools_scm
        return setuptools_scm.get_version(root=Path(__file__).parent, relative_to=__file__)
    except (ImportError, LookupError):
        version_file = Path(__file__).parent / 'VERSION'
        if version_file.exists():
            return version_file.read_text().strip()
        return '0.1.0'  # Default version fallback for clean installation

# Define additional dependencies (dev, docs, testing, etc.)
extras_require = {
    'dev': [
        'black>=22.0',
        'flake8>=5.0',
        'pytest>=6.0',
        'tox>=3.0',
        'sphinx>=4.0',
        'mypy>=0.9',  # Static type checking
        'pylint>=2.0',  # Linting
    ],
    'docs': [
        'sphinx>=4.0',
        'sphinx_rtd_theme>=1.0',
        'recommonmark',  # Markdown support
    ],
    'test': [
        'pytest>=6.0',
        'pytest-cov>=2.0',
        'tox>=3.0',
        'coverage>=5.0',
    ],
}

# Install the main dependencies
install_requires = [
    "typer[all]>=0.7.0",
    "pyyaml>=6.0",
    "rich>=13.0.0",
    "requests>=2.0",  # Common HTTP library
    "Click>=7.0",  # CLI utility
]

# Read long description safely from README file
with open(Path(__file__).parent / 'README.md', encoding='utf-8') as f:
    long_description = f.read()

setup(
    name="adaptmax-cli",
    version=get_version(),  # Dynamically fetch version number
    author="Max's Dad AI",
    author_email="support@adaptmax.ai",
    description="⚙️ AdAptMax Command-Line Interface for secure SaaS deployment and project bootstrapping.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/your-username/adaptmax-cli",
    project_urls={
        "Documentation": "https://github.com/your-username/adaptmax-cli/wiki",
        "Source": "https://github.com/your-username/adaptmax-cli",
        "Tracker": "https://github.com/your-username/adaptmax-cli/issues",
    },
    packages=find_packages(),
    py_modules=["set_up_project"],
    python_requires=">=3.8",
    install_requires=install_requires,
    extras_require=extras_require
